"use client";

import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";

export interface Product {
  id: string;
  title: string | null;
  brand: string | null;
  price_sale: number | null;
  price_original: number | null;
  currency: string | null;
  discount_percent: number | null;
  image_url: string | null;
  sizes_raw: string | null;
  description: string | null;
  merchant_id: string | null;
  merchant_name: string | null;
  last_seen_at?: string | null;
}

export function getDiscountDotColor(percent: number): string | null {
  if (percent >= 65) return "#7D03B6";
  if (percent >= 55) return "#E53935";
  if (percent >= 45) return "#F28C28";
  if (percent >= 35) return "#FFD319";
  if (percent >= 25) return "#1B32FE";
  if (percent >= 15) return "#03B630";
  return null;
}

export function ProductCard({ p, onSelect }: { p: Product; onSelect?: (product: Product) => void }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [broken, setBroken] = useState(false);

  if (broken || !p.image_url) return null;

  return (
    <div className="cursor-pointer" onClick={() => onSelect?.(p)}>
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.image_url}
          alt={p.title ?? "Product image"}
          ref={imgRef}
          className="w-full h-auto block text-transparent"
          onError={() => setBroken(true)}
        />
        {typeof p.discount_percent === "number" &&
          getDiscountDotColor(p.discount_percent) && (
            <Badge
              variant="discount"
              className="discount-badge absolute bottom-[6px] left-[6px] font-serif font-medium"
            >
              <span
                className="block shrink-0 w-[12px] h-[12px] rounded-full"
                style={{ backgroundColor: getDiscountDotColor(p.discount_percent)! }}
              />
              -{p.discount_percent}%
            </Badge>
          )}
      </div>

      <div className="mt-[8px] pr-[16px] font-serif font-medium">
        <div className="text-[13px] text-black italic">{p.brand ?? "—"}</div>
        <div className="text-[13px] text-black/40">{p.title}</div>
        {p.sizes_raw && (
          <div className="text-[13px] text-black/40">
            {p.sizes_raw}
          </div>
        )}
        <div className="flex items-baseline">
          <span className="text-[13px] text-black">
            {p.price_sale ?? "—"} {p.currency ?? "EUR"}
          </span>
          {p.price_original != null && p.price_original !== p.price_sale && (
            <span className="text-[13px] text-black/40 line-through ml-[8px]">
              {p.price_original} {p.currency ?? "EUR"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
