import "dotenv/config";
import fs from "node:fs";
import Firecrawl from "@mendable/firecrawl-js";

// --------------------
// Config
// --------------------
const INPUT_PATH = process.argv[2] ?? "scripts/product-urls.txt";
const OUTPUT_PATH = process.argv[3] ?? "scripts/firecrawl.jsonl";
const CONCURRENCY = Number(process.env.FIRECRAWL_CONCURRENCY ?? 3);
const MAX_RETRIES = Number(process.env.FIRECRAWL_MAX_RETRIES ?? 3);

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const MERCHANT_ID = process.env.MERCHANT_ID;

if (!FIRECRAWL_API_KEY) throw new Error("Missing FIRECRAWL_API_KEY in .env");
if (!MERCHANT_ID) throw new Error("Missing MERCHANT_ID in .env");

const firecrawl = new Firecrawl({ apiKey: FIRECRAWL_API_KEY });

// --------------------
// Schema (keep mock simple: put ALL details into `description`)
// --------------------
// We ask Firecrawl for a single "description/details/product info" block.
// Later, when you switch to feeds, you’ll populate `attributes` properly.
const schema = {
  type: "object",
  properties: {
    title: { type: "string" },
    brand: { type: ["string", "null"] },
    category: { type: ["string", "null"] },

    sku: { type: ["string", "null"] },

    price_original: { type: ["string", "number", "null"] },
    price_sale: { type: ["string", "number", "null"] },
    currency: { type: ["string", "null"] },

    in_stock: { type: ["boolean", "null"] },
    sizes: { type: ["array", "null"], items: { type: "string" } },

    // ✅ NEW: everything goes here for mock data
    description: { type: ["string", "null"] },

    images: { type: ["array", "null"], items: { type: "string" } }
  },
  required: ["title"]
};

// --------------------
// Helpers
// --------------------
const nowIso = () => new Date().toISOString();

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function cleanText(v) {
  if (v == null) return null;
  const s = String(v).replace(/\s+/g, " ").trim();
  return s ? s : null;
}

function normalizePrice(v) {
  if (v == null) return null;
  const s = String(v).replace(/[^\d.,]/g, "").trim();
  if (!s) return null;

  // "129,99" -> "129.99", "1,299.00" -> "1299.00"
  const normalized =
    s.includes(",") && !s.includes(".") ? s.replace(",", ".") : s.replace(/,/g, "");

  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function calcDiscountPercent(orig, sale) {
  if (!orig || !sale) return null;
  if (orig <= 0 || sale <= 0) return null;
  if (sale >= orig) return null;
  return Math.round(((orig - sale) / orig) * 100);
}

function externalIdFromUrl(u) {
  try {
    const parts = new URL(u).pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? u;
  } catch {
    return u;
  }
}

function cleanSizesGeneric(sizes) {
  if (!Array.isArray(sizes)) return null;

  const negativePhrases = [
    // English
    "sold out", "out of stock", "unavailable", "notify me", "notify", "back in stock",
    // German
    "nicht verfügbar", "ausverkauft", "benachrichtigt", "benachrichtige", "wieder verfügbar",
    // French
    "épuisé", "indisponible", "me prévenir",
    // Italian
    "esaurito", "non disponibile", "avvisami",
    // Spanish
    "agotado", "no disponible", "avísame",
    // Dutch
    "niet beschikbaar", "uitverkocht", "houd mij op de hoogte",
  ];

  const uiJunkExact = new Set([
    "choose size", "select size", "size", "sizes",
    "größe wählen", "größe", "wähle die größe",
    "choisir une taille", "taille",
    "seleziona taglia", "taglia",
    "seleccionar talla", "talla",
  ]);

  const cleaned = [];
  const seen = new Set();

  for (const raw of sizes) {
    if (raw == null) continue;

    let s = String(raw).replace(/\s+/g, " ").trim();
    if (!s) continue;

    const lower = s.toLowerCase();

    // drop common UI junk
    if (uiJunkExact.has(lower)) continue;

    // if it contains a strong "not available" signal, drop it
    if (negativePhrases.some(p => lower.includes(p))) continue;

    // strip “low stock” / “last one” style hints (keeps the size)
    s = s
      .replace(/\b(last one|last\s*item|low stock|only\s*\d+\s*left)\b/ig, "")
      .replace(/\b(letzter\s*verfügbar|nur\s*noch\s*\d+)\b/ig, "")
      .replace(/\((.*?)\)/g, (m) => {
        // keep parentheses if it looks like sizing info, otherwise drop
        const inside = m.slice(1, -1).toLowerCase();
        const looksLikeSizing = /(eu|us|uk|it|fr|cm)/i.test(inside);
        return looksLikeSizing ? m : "";
      })
      .replace(/\s+/g, " ")
      .trim();

    if (!s) continue;

    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    cleaned.push(s);
  }

  return cleaned.length ? cleaned : null;
}

function pickExtractedJson(res) {
  // Different SDK versions may nest response slightly differently.
  // We try a few common shapes safely.
  return res?.json ?? res?.data?.json ?? res?.data ?? res?.result?.json ?? {};
}

function buildMockDetailsText(x) {
  // Some sites put the useful "details" in a separate block than narrative description.
  // For mock data, we just merge whatever we got into one readable string.
  const parts = [];

  const desc = cleanText(x.description);
  if (desc) parts.push(desc);

  // If you ever decide to also ask for "details" separately, you can append here.

  return parts.length ? parts.join("\n\n") : null;
}

async function scrapeOne(url) {
  let lastErr = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await firecrawl.scrape(url, {
        // JSON mode
        formats: [{ type: "json", schema }],
        onlyMainContent: true,
        timeout: 60000,
        waitFor: 0,

        // Optional: giving Firecrawl a hint can improve "description/details" capture.
        // If your SDK version supports it, keep; if it errors, remove this line.
        // prompt:
        //   "Extract the product's details/product information text block (materials, care, made in, color, measurements, etc.) into `description`."
      });

      const x = pickExtractedJson(res);

      const price_original = normalizePrice(x.price_original);
      const price_sale = normalizePrice(x.price_sale);

      const images = Array.isArray(x.images) ? x.images.filter(Boolean) : [];
      const imagesMapped = images.map((img, idx) => ({
        url: String(img),
        position: idx + 1,
        width: null,
        height: null
      }));

      const external_id =
        (x.sku && String(x.sku).trim()) || externalIdFromUrl(url);

    const sizes = cleanSizesGeneric(x.sizes);
      const sizes_raw = sizes ? JSON.stringify(sizes) : null;

      const description = buildMockDetailsText(x);

      return {
        ok: true,
        line: {
          merchant_id: MERCHANT_ID,
          external_id,

          title: x.title ? String(x.title).trim() : null,
          brand: x.brand ? String(x.brand).trim() : null,
          category: x.category ? String(x.category).trim() : null,

          price_original,
          price_sale,
          currency: (x.currency && String(x.currency).trim()) || "EUR",
          discount_percent: calcDiscountPercent(price_original, price_sale),

          product_url: url,
          affiliate_url: null,

          sizes_raw,
          in_stock: typeof x.in_stock === "boolean" ? x.in_stock : null,

          last_seen_at: nowIso(),

          // ✅ NEW (mock-simple)
          description,

          // keep attributes empty for now
          attributes: {},

          details_source: "firecrawl",
          details_last_seen_at: nowIso(),

          images: imagesMapped
        }
      };
    } catch (e) {
      lastErr = e;
      const msg = e?.message ?? String(e);

      const backoffMs = Math.min(2000 * attempt, 8000);
      await sleep(backoffMs);

      if (attempt === MAX_RETRIES) {
        return {
          ok: false,
          error: { error: true, product_url: url, reason: msg }
        };
      }
    }
  }

  return {
    ok: false,
    error: {
      error: true,
      product_url: url,
      reason: String(lastErr?.message ?? lastErr)
    }
  };
}

async function promisePool(items, worker, concurrency) {
  const results = [];
  let idx = 0;

  async function runOne() {
    while (true) {
      const i = idx++;
      if (i >= items.length) return;
      results[i] = await worker(items[i], i);
    }
  }

  const runners = Array.from({ length: Math.max(1, concurrency) }, runOne);
  await Promise.all(runners);
  return results;
}

// --------------------
// Main
// --------------------
const urls = fs
  .readFileSync(INPUT_PATH, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter(Boolean);

console.log(`Input URLs: ${urls.length}`);
console.log(`Concurrency: ${CONCURRENCY}, Retries: ${MAX_RETRIES}`);
console.log(`Writing: ${OUTPUT_PATH}`);

const out = fs.createWriteStream(OUTPUT_PATH, { flags: "w" });

const results = await promisePool(
  urls,
  async (url, i) => {
    const res = await scrapeOne(url);

    if (res.ok) {
      out.write(JSON.stringify(res.line) + "\n");
      console.log(
        `OK  ${i + 1}/${urls.length}  ${res.line.external_id}  ${res.line.title}`
      );
    } else {
      out.write(JSON.stringify(res.error) + "\n");
      console.log(`ERR ${i + 1}/${urls.length}  ${url}  ${res.error.reason}`);
    }

    return res;
  },
  CONCURRENCY
);

out.end();

const okCount = results.filter((r) => r?.ok).length;
const errCount = results.length - okCount;

console.log(`Done. OK=${okCount} ERR=${errCount}`);
