import { supabaseServer } from "@/lib/supabase/server";
import { ProductGrid } from "./browse/product-grid";
import { Sidebar } from "./browse/sidebar";
import { HeaderProvider, BrowseHeader, AnimatedContent } from "./browse/browse-header";
import { FilterProvider } from "./browse/filter-context";
import { CurrencyProvider } from "./browse/currency-context";
import { FavoritesProvider } from "./browse/favorites-context";
import { CurrencyPicker } from "./browse/currency-picker";
import { Footer } from "./browse/footer";
import { Button } from "@/components/ui/button";

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
    <CurrencyProvider>
    <FavoritesProvider>
    <FilterProvider>
      <HeaderProvider>
        <div className="relative z-10 bg-white">
          <BrowseHeader
            mobileLogo={<img src="/brand/Almanac.svg" alt="Almanac" className="h-[24px] w-auto" />}
            badges={
              <div className="flex items-center gap-[16px]">
                <Button variant="ghost-link" size="none" asChild><a href="/favorites">Favorites</a></Button>
                <CurrencyPicker />
              </div>
            }
          />
          <AnimatedContent>
            <div className="lg:flex lg:items-start lg:px-[32px] lg:gap-[32px]">
              <Sidebar brands={brands} />
              <main className="px-[16px] pb-[32px] lg:px-0 lg:flex-1 lg:min-w-0">
                <ProductGrid
                  initialProducts={products}
                  initialNextCursor={nextCursor}
                />
              </main>
            </div>
          </AnimatedContent>
        </div>
        <Footer />
      </HeaderProvider>
    </FilterProvider>
    </FavoritesProvider>
    </CurrencyProvider>
  );
}
