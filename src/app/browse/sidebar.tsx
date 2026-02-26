"use client";

import { useRef, useState } from "react";
import { getDiscountDotColor } from "./product-card";
import { useHeaderPinned } from "./browse-header";
import { useFilters } from "./filter-context";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

const DISCOUNT_STOPS = [20, 30, 40, 50, 60] as const;
const CATEGORIES = ["All", "Clothing", "Shoes", "Accessories"] as const;

type SheetType = "category" | "discount" | "brands" | null;

function getThumbColor(value: number): string {
  return getDiscountDotColor(value) ?? "#03B630";
}

function FilterBox({
  label,
  right,
  children,
}: {
  label: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="filter-box bg-[#F6F6F3] p-[12px] rounded-[16px]">
      <div className="flex items-center justify-between">
        <span className="text-[12px] uppercase">{label}</span>
        {right}
      </div>
      {children}
    </div>
  );
}

function CategoryFilter() {
  const [selected, setSelected] = useState<string>("All");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>();

  return (
    <DropdownMenu
      modal={false}
      onOpenChange={(open) => {
        if (open && triggerRef.current) {
          setTriggerWidth(triggerRef.current.offsetWidth);
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          ref={triggerRef}
          className="filter-box bg-[#F6F6F3] p-[12px] rounded-[16px] w-full flex items-center justify-between cursor-pointer outline-none"
        >
          <span className="text-[12px] uppercase">{selected.toUpperCase()}</span>
          <span className="text-[12px] leading-none select-none">▾</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="filter-box bg-white border border-black/10 p-[4px] rounded-[16px] category-dropdown"
        sideOffset={4}
        align="start"
        style={{ width: triggerWidth }}
      >
        {CATEGORIES.map((cat) => (
          <DropdownMenuItem
            key={cat}
            className={`text-[12px] font-sans font-medium px-[8px] py-[6px] cursor-pointer uppercase ${selected === cat ? "text-black" : "text-black/40"}`}
            onSelect={() => setSelected(cat)}
          >
            {cat}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function snapToStop(raw: number): number {
  let closest: number = DISCOUNT_STOPS[0];
  let minDist = Math.abs(raw - closest);
  for (const stop of DISCOUNT_STOPS as readonly number[]) {
    const dist = Math.abs(raw - stop);
    if (dist < minDist) {
      minDist = dist;
      closest = stop;
    }
  }
  return closest;
}

function DiscountFilter() {
  const { minDiscount, setMinDiscount } = useFilters();
  const [snappedValue, setSnappedValue] = useState(minDiscount ?? 20);
  const [dragging, setDragging] = useState(false);
  const [liveValue, setLiveValue] = useState(minDiscount ?? 20);

  const displayValue = dragging ? snapToStop(liveValue) : snappedValue;
  const thumbColor = getThumbColor(displayValue);
  const isActive = minDiscount !== null;

  return (
    <FilterBox label="Min. Discount">
      <div className="mt-[8px] flex items-center gap-[10px]">
        <button
          onClick={() => {
            if (isActive) {
              setMinDiscount(null);
              setSnappedValue(20);
              setLiveValue(20);
            }
          }}
          className={`text-[13px] shrink-0 font-serif font-medium text-black ${isActive ? "cursor-pointer" : ""}`}
        >
          -{displayValue}%
        </button>
        <Slider
          min={20}
          max={60}
          step={1}
          value={[dragging ? liveValue : snappedValue]}
          onValueChange={([raw]) => {
            if (dragging) {
              setLiveValue(raw);
            } else {
              setSnappedValue(snapToStop(raw));
            }
          }}
          onValueCommit={([raw]) => {
            const snapped = snapToStop(raw);
            setSnappedValue(snapped);
            setMinDiscount(snapped);
            setDragging(false);
          }}
          onPointerDown={() => setDragging(true)}
          className="discount-slider w-full"
          style={{ "--thumb-color": thumbColor } as React.CSSProperties}
        />
      </div>
    </FilterBox>
  );
}

function BrandsFilter({ brands }: { brands: string[] }) {
  const { selectedBrands, toggleBrand, clearBrands } = useFilters();

  return (
    <div className="filter-box bg-[#F6F6F3] p-[12px] rounded-[16px] min-h-0 flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <span className="text-[12px] uppercase">Brands</span>
        {selectedBrands.size > 0 && (
          <button
            onClick={clearBrands}
            className="text-[12px] text-black/40 cursor-pointer hover:text-black transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      <div className="mt-[12px] overflow-y-auto flex flex-col gap-[12px] min-h-0">
        {brands.map((brand) => (
          <button
            key={brand}
            onClick={() => toggleBrand(brand)}
            className={`text-[13px] font-serif font-medium text-left cursor-pointer hover:opacity-60 transition-opacity shrink-0 ${
              selectedBrands.has(brand) ? "text-black italic" : "text-black/50"
            }`}
          >
            {brand}
          </button>
        ))}
      </div>
    </div>
  );
}

function SidebarFilters({ brands, className }: { brands: string[]; className?: string }) {
  return (
    <div className={`flex flex-col gap-[8px] ${className ?? ""}`}>
      <CategoryFilter />
      <DiscountFilter />
      <BrandsFilter brands={brands} />
    </div>
  );
}

/* ── Mobile Filter Chips ── */

function MobileFilterChips({ brands }: { brands: string[] }) {
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const headerPinned = useHeaderPinned();
  const { minDiscount, selectedBrands, toggleBrand, clearBrands } = useFilters();

  return (
    <>
      {/* Chip row */}
      <div
        className={`lg:hidden sticky z-30 bg-white px-[24px] py-[8px] flex gap-[8px] overflow-x-auto transition-[top] duration-200 ${
          headerPinned ? "top-[72px]" : "top-0"
        }`}
      >
        <Button
          variant="chip"
          className="nav-pill px-[14px] py-[7px] whitespace-nowrap shrink-0"
          onClick={() => setActiveSheet("category")}
        >
          {selectedCategory} ▾
        </Button>
        <Button
          variant="chip"
          className="nav-pill px-[14px] py-[7px] whitespace-nowrap shrink-0"
          onClick={() => setActiveSheet("discount")}
        >
          {minDiscount !== null ? `-${minDiscount}%+` : "Min. Discount"} ▾
        </Button>
        <Button
          variant="chip"
          className="nav-pill px-[14px] py-[7px] whitespace-nowrap shrink-0"
          onClick={() => setActiveSheet("brands")}
        >
          {selectedBrands.size > 0 ? `Brands (${selectedBrands.size})` : "Brands"} ▾
        </Button>
      </div>

      {/* Category bottom sheet */}
      <Drawer open={activeSheet === "category"} onOpenChange={(open) => !open && setActiveSheet(null)}>
        <DrawerContent>
          <DrawerTitle className="sr-only">Category</DrawerTitle>
          <div className="px-[20px] pb-[28px] pt-[8px] flex flex-col gap-[4px]">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`text-[14px] font-sans font-medium text-left px-[4px] py-[10px] uppercase cursor-pointer ${selectedCategory === cat ? "text-black" : "text-black/40"}`}
                onClick={() => {
                  setSelectedCategory(cat);
                  setActiveSheet(null);
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Discount bottom sheet */}
      <Drawer open={activeSheet === "discount"} onOpenChange={(open) => !open && setActiveSheet(null)}>
        <DrawerContent>
          <DrawerTitle className="sr-only">Discount</DrawerTitle>
          <div className="px-[20px] pb-[28px] pt-[8px]">
            <DiscountFilter />
          </div>
        </DrawerContent>
      </Drawer>

      {/* Brands bottom sheet */}
      <Drawer open={activeSheet === "brands"} onOpenChange={(open) => !open && setActiveSheet(null)}>
        <DrawerContent>
          <DrawerTitle className="sr-only">Brands</DrawerTitle>
          <div className="px-[20px] pb-[28px] pt-[8px]">
            {selectedBrands.size > 0 && (
              <button
                onClick={clearBrands}
                className="text-[11px] text-black/40 cursor-pointer hover:text-black transition-colors mb-[12px]"
              >
                Clear all
              </button>
            )}
            <div className="max-h-[60vh] overflow-y-auto flex flex-col gap-[12px]">
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => toggleBrand(brand)}
                  className={`text-[13px] font-serif font-medium text-left cursor-pointer hover:opacity-60 transition-opacity ${
                    selectedBrands.has(brand) ? "text-black italic" : "text-black/50"
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export function Sidebar({ brands }: { brands: string[] }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex sticky top-[80px] mt-[64px] w-[200px] h-[calc(100dvh-80px)] pb-[8px] flex-col font-sans font-medium z-20 shrink-0"
      >
        <SidebarFilters brands={brands} className="min-h-0 flex-1" />
      </aside>

      {/* Mobile filter chips + bottom sheets */}
      <MobileFilterChips brands={brands} />
    </>
  );
}
