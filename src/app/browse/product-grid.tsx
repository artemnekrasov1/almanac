"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProductCard } from "./product-card";
import { ProductDetailOverlay } from "./product-detail-overlay";
import { useFilters } from "./filter-context";
import { Button } from "@/components/ui/button";
import type { Product } from "./product-card";

interface Props {
  initialProducts: Product[];
  initialNextCursor: string | null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function productToSlug(product: Product): string {
  const parts = [product.brand, product.title].filter(Boolean).map((s) => slugify(s!));
  return [...parts, product.id].join("--");
}

function getProductIdFromURL(): string | null {
  const params = new URLSearchParams(window.location.search);
  const pdp = params.get("pdp");
  if (!pdp) return null;
  // ID is always the last segment after "--"
  const segments = pdp.split("--");
  return segments[segments.length - 1];
}

function buildFilterParams(minDiscount: number | null, selectedBrands: Set<string>): string {
  const params = new URLSearchParams();
  if (minDiscount !== null) params.set("minDiscount", String(minDiscount));
  if (selectedBrands.size > 0) params.set("brands", [...selectedBrands].join(","));
  return params.toString();
}

export function ProductGrid({ initialProducts, initialNextCursor }: Props) {
  const { minDiscount, selectedBrands } = useFilters();
  const [products, setProducts] = useState(initialProducts);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const autoLoadCount = useRef(0);
  const loadingRef = useRef(false);

  // Stable string key for filter deps
  const filterKey = useMemo(
    () => buildFilterParams(minDiscount, selectedBrands),
    [minDiscount, selectedBrands]
  );

  // Open PDP from URL on initial load (shared link)
  useEffect(() => {
    const pdpId = getProductIdFromURL();
    if (!pdpId) return;

    // Check if product is already loaded
    const found = initialProducts.find((p) => p.id === pdpId);
    if (found) {
      setSelectedProduct(found);
      return;
    }

    // Fetch from API for shared URLs
    fetch(`/api/product?id=${encodeURIComponent(pdpId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) setSelectedProduct(data.product);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle browser back/forward
  useEffect(() => {
    const onPopState = () => {
      const pdpId = getProductIdFromURL();
      if (!pdpId) {
        setSelectedProduct(null);
      } else {
        const found = products.find((p) => p.id === pdpId);
        if (found) setSelectedProduct(found);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [products]);

  const selectProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    const url = new URL(window.location.href);
    url.searchParams.set("pdp", productToSlug(product));
    window.history.pushState({}, "", url.toString());
  }, []);

  const closeProduct = useCallback(() => {
    setSelectedProduct(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("pdp");
    window.history.pushState({}, "", url.toString());
  }, []);

  // Incremented on each filter-triggered reload to re-key the grid for animation
  const [gridEpoch, setGridEpoch] = useState(0);

  // Reset & refetch when filters change
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    let cancelled = false;
    setLoading(true);
    setProducts([]);
    setNextCursor(null);
    autoLoadCount.current = 0;
    loadingRef.current = false;
    setShowLoadMore(false);

    const qs = filterKey ? `?${filterKey}` : "";
    fetch(`/api/browse${qs}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setProducts(data.products ?? []);
        setNextCursor(data.nextCursor ?? null);
        setGridEpoch((e) => e + 1);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [filterKey]);

  const fetchMore = useCallback(async () => {
    if (!nextCursor || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    const filterQs = filterKey ? `&${filterKey}` : "";
    try {
      const res = await fetch(
        `/api/browse?cursor=${encodeURIComponent(nextCursor)}${filterQs}`
      );
      if (!res.ok) return;
      const data = await res.json();
      setProducts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const fresh = (data.products as Product[]).filter((p) => !seen.has(p.id));
        return [...prev, ...fresh];
      });
      setNextCursor(data.nextCursor);
      autoLoadCount.current += 1;
      if (autoLoadCount.current >= 1) {
        setShowLoadMore(true);
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [nextCursor, filterKey]);

  // Keep a stable ref to fetchMore so the observer doesn't re-create on every render
  const fetchMoreRef = useRef(fetchMore);
  fetchMoreRef.current = fetchMore;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && autoLoadCount.current < 1) {
          fetchMoreRef.current();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
    // Only re-create when the sentinel element changes (showLoadMore toggles it)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLoadMore]);

  return (
    <>
      <div
        key={gridEpoch}
        className={`mt-[16px] lg:mt-[64px] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-[16px] lg:gap-[32px] items-start font-sans font-medium ${gridEpoch > 0 ? "animate-grid-fade-in" : ""}`}
      >
        {products.map((p) => (
          <ProductCard key={p.id} p={p} onSelect={selectProduct} />
        ))}
      </div>

      {nextCursor && !showLoadMore && (
        <div ref={sentinelRef} className="mt-6 flex justify-center py-4">
          {loading && (
            <span className="text-sm text-black/40">Loading...</span>
          )}
        </div>
      )}

      {nextCursor && showLoadMore && (
        <div className="mt-6 flex justify-center py-4">
          {loading ? (
            <span className="text-sm text-black/40">Loading...</span>
          ) : (
            <Button variant="pill-secondary" onClick={fetchMore}>
              Load More
            </Button>
          )}
        </div>
      )}

      {selectedProduct && (
        <ProductDetailOverlay
          product={selectedProduct}
          onClose={closeProduct}
        />
      )}
    </>
  );
}
