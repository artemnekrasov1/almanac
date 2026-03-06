"use client";

import { useCallback, useEffect, useState } from "react";
import { Footer } from "@/app/browse/footer";
import { CurrencyProvider } from "@/app/browse/currency-context";
import { CurrencyPicker } from "@/app/browse/currency-picker";
import { FavoritesProvider, useFavorites } from "@/app/browse/favorites-context";
import { ProductCard, type Product } from "@/app/browse/product-card";
import { ProductDetailOverlay } from "@/app/browse/product-detail-overlay";
import { Button } from "@/components/ui/button";

function FavoritesGrid() {
  const { favoriteIds } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (favoriteIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/favorites?ids=${favoriteIds.join(",")}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [favoriteIds]);

  const selectProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  const closeProduct = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-sm text-black/40">Loading...</span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="font-serif text-[17px] text-black/40">No favorites yet</p>
      </div>
    );
  }

  return (
    <>
      <main className="px-[16px] pb-[32px] lg:px-[32px] flex-1">
        <div className="mt-[16px] lg:mt-[32px] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-[16px] lg:gap-[32px] items-start font-sans font-medium">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} onSelect={selectProduct} />
          ))}
        </div>
      </main>
      {selectedProduct && (
        <ProductDetailOverlay
          product={selectedProduct}
          onClose={closeProduct}
        />
      )}
    </>
  );
}

export default function FavoritesPage() {
  return (
    <CurrencyProvider>
      <FavoritesProvider>
        <div className="relative z-10 flex min-h-screen flex-col bg-white">
          {/* ── Mobile header ── */}
          <header className="lg:hidden flex items-center justify-between px-[16px] pt-[24px] pb-[12px]">
            <a href="/">
              <img
                src="/brand/Almanac.svg"
                alt="Almanac"
                className="h-[24px] w-auto"
              />
            </a>
            <div className="flex items-center gap-[16px]">
              <Button variant="ghost-link" size="none" className="opacity-40 pointer-events-none">
                Favorites
              </Button>
              <CurrencyPicker />
            </div>
          </header>

          {/* ── Desktop header ── */}
          <header className="hidden lg:flex items-center justify-between px-[32px] pt-[24px] pb-[24px]">
            <a
              href="/"
              className="text-[32px] font-serif font-normal italic leading-[1.25]"
            >
              Almanac
            </a>
            <div className="flex items-center gap-[16px]">
              <Button variant="ghost-link" size="none" className="opacity-40 pointer-events-none">
                Favorites
              </Button>
              <CurrencyPicker />
            </div>
          </header>

          <FavoritesGrid />
        </div>
        <Footer />
      </FavoritesProvider>
    </CurrencyProvider>
  );
}
