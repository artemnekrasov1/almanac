import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/ingest-atlas-jsonl.mjs <file.jsonl>");
  process.exit(1);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing env vars NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// IMPORTANT: service role runs only locally/server-side. Never expose it to the browser.
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function parseJSONL(text) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => JSON.parse(l))
    .filter((o) => !o.error);
}

function handleFromUrl(productUrl) {
  try {
    const u = new URL(productUrl);
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("products");
    return idx >= 0 ? parts[idx + 1] : productUrl;
  } catch {
    return productUrl;
  }
}

function normalize(item) {
  const product_url = item.product_url;
  const external_id =
    item.external_id && item.external_id.startsWith("http")
      ? handleFromUrl(item.external_id)
      : item.external_id || handleFromUrl(product_url);

  const images = Array.isArray(item.images) ? item.images : [];
  const primary =
    images.find((im) => im.position === 1)?.url || images[0]?.url || null;

  return {
    merchant_id: item.merchant_id,
    external_id,
    title: item.title ?? null,
    brand: item.brand ?? null,
    category: item.category ?? null,
    price_original: item.price_original ?? null,
    price_sale: item.price_sale ?? null,
    currency: item.currency ?? "EUR",
    discount_percent: item.discount_percent ?? null,
    product_url: product_url ?? null,
    affiliate_url: item.affiliate_url ?? null,
    image_url: primary,
    sizes_raw: item.sizes_raw ?? null,
    in_stock: typeof item.in_stock === "boolean" ? item.in_stock : null,
    last_seen_at: item.last_seen_at ?? new Date().toISOString(),

    // ✅ New columns (mock-simple)
    // For mock data you said you want everything in description, so:
    description: item.description ?? null,
    // Keep attributes present but empty unless your JSONL already includes it.
    attributes: item.attributes ?? {},

    images: images
      .map((im, i) => ({
        url: im.url,
        position: Number.isFinite(im.position) ? im.position : i + 1,
        width: im.width ?? null,
        height: im.height ?? null,
      }))
      .filter((im) => typeof im.url === "string" && im.url.length > 0),
  };
}

async function upsertProducts(products) {
  // IMPORTANT: we don’t want to accidentally wipe description/attributes
  // if some scrape runs return null/empty. So we drop those keys when empty
  // and only upsert them when they exist.
  const rows = products.map((p) => {
    const { images, ...rest } = p;

    // Don't overwrite with empty description
    if (
      rest.description == null ||
      (typeof rest.description === "string" && rest.description.trim() === "")
    ) {
      delete rest.description;
    }

    // Don't overwrite with empty attributes
    if (
      rest.attributes == null ||
      (typeof rest.attributes === "object" &&
        !Array.isArray(rest.attributes) &&
        Object.keys(rest.attributes).length === 0)
    ) {
      delete rest.attributes;
    }

    return rest;
  });

  const { data, error } = await supabase
    .from("products")
    .upsert(rows, { onConflict: "merchant_id,external_id" })
    .select("id,merchant_id,external_id");

  if (error) throw error;
  return data;
}

async function replaceImagesForProduct({ product_id, merchant_id, images }) {
  // delete existing
  const del = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", product_id);

  if (del.error) throw del.error;

  if (!images.length) return;

  const imgRows = images.map((im) => ({
    product_id,
    merchant_id,
    url: im.url,
    position: im.position,
    width: im.width,
    height: im.height,
  }));

  const ins = await supabase.from("product_images").insert(imgRows);
  if (ins.error) throw ins.error;
}

async function main() {
  const text = fs.readFileSync(path.resolve(file), "utf8");
  const raw = parseJSONL(text);
  const normalized = raw.map(normalize);

  console.log(`Loaded ${normalized.length} products from JSONL`);

  // upsert products
  const upserted = await upsertProducts(normalized);
  console.log(`Upserted ${upserted.length} products`);

  // map for quick lookup
  const idMap = new Map(
    upserted.map((r) => [`${r.merchant_id}:${r.external_id}`, r.id])
  );

  // replace images
  for (const p of normalized) {
    const key = `${p.merchant_id}:${p.external_id}`;
    const product_id = idMap.get(key);
    if (!product_id) continue;

    await replaceImagesForProduct({
      product_id,
      merchant_id: p.merchant_id,
      images: p.images,
    });
  }

  console.log("Done: images refreshed");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
 