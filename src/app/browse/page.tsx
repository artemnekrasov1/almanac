import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { cursor?: string };
}) {
  const PAGE_SIZE = 30;

  // Parse cursor from search params
  const cursor = searchParams.cursor;

  let cursorLastSeenAt: string | null = null;
  let cursorId: string | null = null;

  if (cursor) {
    try {
      const parts = cursor.split("|");
      if (parts.length === 2) {
        cursorLastSeenAt = parts[0];
        cursorId = parts[1];
      }
    } catch {
      // Invalid cursor, treat as no cursor
    }
  }

  // Build query
  const supabase = supabaseServer();
  let query = supabase
    .from("products")
    .select(
      "id,title,brand,price_sale,currency,discount_percent,image_url,product_url,last_seen_at"
    )
    .not("last_seen_at", "is", null)
    .order("last_seen_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(PAGE_SIZE + 1);

  // Apply cursor filter if present
  if (cursorLastSeenAt && cursorId) {
    query = query.or(
      `last_seen_at.lt.${encodeURIComponent(cursorLastSeenAt)},and(last_seen_at.eq.${encodeURIComponent(cursorLastSeenAt)},id.lt.${encodeURIComponent(cursorId)})`
    );
  }

  // Execute query
  const { data: rows, error } = await query;

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Browse</h1>
        <pre className="mt-4 rounded bg-red-50 p-4 text-sm text-red-700">
          {error.message}
        </pre>
      </main>
    );
  }

  // Determine pagination
  const hasNextPage = (rows?.length ?? 0) > PAGE_SIZE;
  const products = hasNextPage ? rows!.slice(0, PAGE_SIZE) : rows ?? [];

  // Compute next cursor
  let nextCursor: string | null = null;
  if (hasNextPage && products.length > 0) {
    const last = products[products.length - 1];
    nextCursor = `${last.last_seen_at}|${last.id}`;
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Browse</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((p) => (
          <div key={p.id} className="rounded-lg border p-3">
            {p.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.image_url}
                alt={p.title ?? "Product image"}
                className="h-56 w-full rounded-md object-cover"
              />
            ) : (
              <div className="h-56 w-full rounded-md bg-gray-100" />
            )}

            <div className="mt-3 text-sm font-medium">{p.title}</div>

            <div className="mt-1 text-xs text-gray-600">
              {p.brand ?? "—"}
            </div>

            <div className="mt-2 flex items-center justify-between text-sm">
              <span>
                {p.price_sale ?? "—"} {p.currency ?? "EUR"}
              </span>
              {typeof p.discount_percent === "number" ? (
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">
                  -{p.discount_percent}%
                </span>
              ) : null}
            </div>

            {p.product_url ? (
              <a
                href={`/out/${p.id}`}
                className="mt-3 inline-block text-sm underline"
              >
                View
              </a>
            ) : null}
          </div>
        ))}
      </div>

      {hasNextPage && nextCursor && (
        <div className="mt-6 text-center">
          <a
            href={`/browse?cursor=${encodeURIComponent(nextCursor)}`}
            className="inline-block rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            Load more
          </a>
        </div>
      )}
    </main>
  );
}
