import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

const PAGE_SIZE = 30;

export async function GET(req: NextRequest) {
  const cursor = req.nextUrl.searchParams.get("cursor");
  const minDiscountParam = req.nextUrl.searchParams.get("minDiscount");
  const brandsParam = req.nextUrl.searchParams.get("brands");

  let cursorShuffleScore: string | null = null;
  let cursorId: string | null = null;

  if (cursor) {
    const parts = cursor.split("|");
    if (parts.length === 2) {
      cursorShuffleScore = parts[0];
      cursorId = parts[1];
    }
  }

  const supabase = supabaseServer();
  let query = supabase
    .from("products")
    .select(
      "id,title,brand,price_sale,price_original,currency,discount_percent,image_url,product_url,sizes_raw,description,last_seen_at,shuffle_score,merchant_id,merchants(name)"
    )
    .not("last_seen_at", "is", null)
    .order("shuffle_score", { ascending: true })
    .order("id", { ascending: true })
    .limit(PAGE_SIZE + 1);

  if (minDiscountParam) {
    const minDiscount = parseInt(minDiscountParam, 10);
    if (!isNaN(minDiscount)) {
      query = query.gte("discount_percent", minDiscount);
    }
  }

  if (brandsParam) {
    const brandsArray = brandsParam.split(",").filter(Boolean);
    if (brandsArray.length > 0) {
      query = query.in("brand", brandsArray);
    }
  }

  if (cursorShuffleScore && cursorId) {
    query = query.or(
      `shuffle_score.gt.${cursorShuffleScore},and(shuffle_score.eq.${cursorShuffleScore},id.gt.${cursorId})`
    );
  }

  const { data: rows, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const hasNextPage = (rows?.length ?? 0) > PAGE_SIZE;
  const rawProducts = hasNextPage ? rows!.slice(0, PAGE_SIZE) : rows ?? [];
  const products = rawProducts.map(({ merchants, ...rest }: any) => ({
    ...rest,
    merchant_name: merchants?.name ?? null,
  }));

  let nextCursor: string | null = null;
  if (hasNextPage && products.length > 0) {
    const last = products[products.length - 1];
    nextCursor = `${last.shuffle_score}|${last.id}`;
  }

  return NextResponse.json({ products, nextCursor });
}
