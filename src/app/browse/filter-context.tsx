"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface FilterState {
  minDiscount: number | null;
  selectedBrands: Set<string>;
  setMinDiscount: (value: number | null) => void;
  toggleBrand: (brand: string) => void;
  clearBrands: () => void;
}

const FilterContext = createContext<FilterState | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [minDiscount, setMinDiscount] = useState<number | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());

  const toggleBrand = useCallback((brand: string) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brand)) {
        next.delete(brand);
      } else {
        next.add(brand);
      }
      return next;
    });
  }, []);

  const clearBrands = useCallback(() => {
    setSelectedBrands(new Set());
  }, []);

  return (
    <FilterContext.Provider
      value={{ minDiscount, selectedBrands, setMinDiscount, toggleBrand, clearBrands }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilters must be used within FilterProvider");
  return ctx;
}
