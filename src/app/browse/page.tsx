import { supabaseServer } from "@/lib/supabase/server";
import { ProductGrid } from "./product-grid";
import { Sidebar } from "./sidebar";
import { Badge } from "@/components/ui/badge";
import { HeaderProvider, BrowseHeader, AnimatedContent } from "./browse-header";
import { FilterProvider } from "./filter-context";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

export default async function BrowsePage() {
  const supabase = supabaseServer();

  const { data: brandRows } = await supabase
    .from("products")
    .select("brand")
    .not("brand", "is", null)
    .not("last_seen_at", "is", null);

  const brands = [
    ...new Set((brandRows ?? []).map((r: { brand: string }) => r.brand)),
  ].sort((a, b) => a.localeCompare(b));

  const { data: rows, error } = await supabase
    .from("products")
    .select(
      "id,title,brand,price_sale,price_original,currency,discount_percent,image_url,product_url,sizes_raw,description,last_seen_at,shuffle_score,merchant_id,merchants(name)"
    )
    .not("last_seen_at", "is", null)
    .order("shuffle_score", { ascending: true })
    .order("id", { ascending: true })
    .limit(PAGE_SIZE + 1);

  if (error) {
    return (
      <main className="p-6">
        <p className="text-sm text-red-700">{error.message}</p>
      </main>
    );
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

  return (
    <FilterProvider>
      <HeaderProvider>
        <div className="relative">
          <BrowseHeader
            mobileLogo={<img src="/brand/Almanac.svg" alt="Almanac" className="h-[24px] w-auto" />}
            badges={
              <div className="flex items-center gap-[8px]">
                <Badge variant="nav" className="nav-pill">Favorites</Badge>
                <Badge variant="nav" className="nav-pill w-[32px] px-0 justify-center">€</Badge>
              </div>
            }
          />
          <AnimatedContent>
            <div className="lg:flex lg:items-start lg:px-[32px] lg:gap-[32px]">
              <Sidebar brands={brands} />
              <main className="px-[24px] pb-[32px] lg:px-0 lg:flex-1 lg:min-w-0">
                <ProductGrid
                  initialProducts={products}
                  initialNextCursor={nextCursor}
                />
              </main>
            </div>
          </AnimatedContent>
        </div>
      </HeaderProvider>
    </FilterProvider>
  );
}
