import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get("ids");
  if (!idsParam) {
    return NextResponse.json({ products: [] });
  }

  const ids = idsParam.split(",").filter(Boolean);
  if (ids.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const supabase = supabaseServer();
  const { data: rows, error } = await supabase
    .from("products")
    .select(
      "id,title,brand,price_sale,price_original,currency,discount_percent,image_url,product_url,sizes_raw,description,last_seen_at,merchant_id,merchants(name)"
    )
    .in("id", ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const products = (rows ?? []).map(({ merchants, ...rest }: any) => ({
    ...rest,
    merchant_name: merchants?.name ?? null,
  }));

  return NextResponse.json({ products });
}
