"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";

/* ------------------------------------------------------------------ */
/*  Metadata via <head> since this is a client component               */
/* ------------------------------------------------------------------ */

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-sans font-medium text-[12px] uppercase tracking-wide text-black/40 mb-8">
    {children}
  </h2>
);

const Annotation = ({ children }: { children: React.ReactNode }) => (
  <p className="font-mono text-[13px] text-black/40 mt-2">{children}</p>
);

/* ------------------------------------------------------------------ */
/*  Typography data                                                    */
/* ------------------------------------------------------------------ */

const typographyStyles = [
  {
    name: "Page Heading",
    classes: "font-serif text-[32px] leading-[1.25]",
    font: "Crimson Pro",
    weight: "Regular (400)",
    usage: "Browse header",
    sample: "Almanac is a curated selection",
  },
  {
    name: "Page Heading Italic",
    classes: "font-serif italic text-[32px] leading-[1.25]",
    font: "Crimson Pro",
    weight: "Regular Italic (400)",
    usage: '"Almanac" word',
    sample: "Almanac",
  },
  {
    name: "Product Brand",
    classes: "font-serif italic text-[22px] leading-tight",
    font: "Crimson Pro",
    weight: "Regular Italic (400)",
    usage: "Detail overlay brand",
    sample: "Maison Margiela",
  },
  {
    name: "Product Title (detail)",
    classes: "font-serif text-[17px] text-black/40",
    font: "Crimson Pro",
    weight: "Regular (400)",
    usage: "Detail overlay title",
    sample: "Replica Leather Sneakers",
  },
  {
    name: "Price",
    classes: "font-serif text-[17px]",
    font: "Crimson Pro",
    weight: "Regular (400)",
    usage: "Sale price",
    sample: "€245",
  },
  {
    name: "Price Strikethrough",
    classes: "font-serif text-[17px] text-black/40 line-through",
    font: "Crimson Pro",
    weight: "Regular (400)",
    usage: "Original price",
    sample: "€490",
  },
  {
    name: "Card Text",
    classes: "font-serif italic text-[14px]",
    font: "Crimson Pro",
    weight: "Regular Italic (400)",
    usage: "Card brand",
    sample: "Bottega Veneta",
  },
  {
    name: "Card Secondary",
    classes: "font-serif text-[14px] text-black/40",
    font: "Crimson Pro",
    weight: "Regular (400)",
    usage: "Card title/description",
    sample: "Intrecciato Leather Wallet",
  },
  {
    name: "Filter Value",
    classes: "font-serif text-[14px]",
    font: "Crimson Pro",
    weight: "Regular (400)",
    usage: "Sidebar brand/discount values",
    sample: "Acne Studios",
  },
  {
    name: "Label / Small Caps",
    classes: "font-sans font-medium text-[12px] uppercase",
    font: "Geist Sans",
    weight: "Medium (500)",
    usage: "Buttons, filters, nav",
    sample: "Category",
  },
  {
    name: "Micro Label",
    classes:
      "font-sans font-medium text-[11px] uppercase text-black/40 tracking-wide",
    font: "Geist Sans",
    weight: "Medium (500)",
    usage: '"Available sizes"',
    sample: "Available Sizes",
  },
];

/* ------------------------------------------------------------------ */
/*  Color data                                                         */
/* ------------------------------------------------------------------ */

const colorGroups = [
  {
    label: "Core",
    colors: [
      { value: "#FFFFFF", name: "background", usage: "Page background", border: true },
      { value: "#000000", name: "foreground", usage: "Primary text" },
      { value: "#F6F6F3", name: "secondary", usage: "Chips, filter boxes, accents" },
      { value: "oklch(0.556 0 0)", name: "muted-foreground", usage: "Muted text" },
    ],
  },
  {
    label: "Discount Scale",
    colors: [
      { value: "#03B630", name: "green", usage: "≥15% discount" },
      { value: "#1B32FE", name: "blue", usage: "≥25% discount" },
      { value: "#FFD319", name: "yellow", usage: "≥35% discount" },
      { value: "#F28C28", name: "orange", usage: "≥45% discount" },
      { value: "#E53935", name: "red", usage: "≥55% discount" },
      { value: "#7D03B6", name: "purple", usage: "≥65% discount" },
    ],
  },
  {
    label: "UI",
    colors: [
      { value: "oklch(0.922 0 0)", name: "border", usage: "Borders, dividers" },
      { value: "oklch(0.708 0 0)", name: "ring", usage: "Focus rings" },
      { value: "#F2F2EE", name: "nav badge bg", usage: "Nav pill background" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Component: Color Swatch                                            */
/* ------------------------------------------------------------------ */

const Swatch = ({
  color,
  name,
  usage,
  border,
}: {
  color: string;
  name: string;
  usage: string;
  border?: boolean;
}) => (
  <div className="flex items-center gap-3">
    <div
      className="w-10 h-10 rounded-md shrink-0"
      style={{
        backgroundColor: color,
        border: border ? "1px solid oklch(0.922 0 0)" : undefined,
      }}
    />
    <div>
      <p className="font-mono text-[13px]">{color}</p>
      <p className="font-mono text-[13px] text-black/40">
        {name} — {usage}
      </p>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Discount colors for badge examples                                 */
/* ------------------------------------------------------------------ */

const discountExamples = [
  { color: "#03B630", percent: 20 },
  { color: "#1B32FE", percent: 30 },
  { color: "#FFD319", percent: 40 },
  { color: "#F28C28", percent: 50 },
  { color: "#E53935", percent: 55 },
  { color: "#7D03B6", percent: 65 },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DesignPage() {
  const [sliderValue, setSliderValue] = useState([30]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const getThumbColor = (v: number) => {
    if (v >= 60) return "#7D03B6";
    if (v >= 50) return "#E53935";
    if (v >= 40) return "#F28C28";
    if (v >= 30) return "#FFD319";
    return "#03B630";
  };

  return (
    <>
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>

      <div className="mx-auto max-w-[960px] px-6 py-16 space-y-20">
        {/* Title */}
        <div>
          <h1 className="font-serif text-[32px] leading-[1.25]">
            Design System
          </h1>
          <p className="font-mono text-[13px] text-black/40 mt-2">
            Internal reference for Almanac typography, colors, and components.
          </p>
        </div>

        {/* -------------------------------------------------------- */}
        {/*  Typography                                               */}
        {/* -------------------------------------------------------- */}
        <section>
          <SectionHeader>Typography</SectionHeader>
          <div className="space-y-8">
            {typographyStyles.map((t) => (
              <div key={t.name} className="border-b border-black/5 pb-8">
                <p className={t.classes}>{t.sample}</p>
                <Annotation>
                  {t.name} · {t.font} {t.weight} · {t.classes} · {t.usage}
                </Annotation>
              </div>
            ))}
          </div>
        </section>

        {/* -------------------------------------------------------- */}
        {/*  Colors                                                   */}
        {/* -------------------------------------------------------- */}
        <section>
          <SectionHeader>Colors</SectionHeader>
          <div className="space-y-10">
            {colorGroups.map((group) => (
              <div key={group.label}>
                <p className="font-sans font-medium text-[11px] uppercase tracking-wide text-black/40 mb-4">
                  {group.label}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {group.colors.map((c) => (
                    <Swatch
                      key={c.name}
                      color={c.value}
                      name={c.name}
                      usage={c.usage}
                      border={("border" in c && c.border) || false}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* -------------------------------------------------------- */}
        {/*  Components                                               */}
        {/* -------------------------------------------------------- */}
        <section>
          <SectionHeader>Components</SectionHeader>
          <div className="space-y-14">
            {/* Badge — discount variant */}
            <div>
              <p className="font-sans font-medium text-[11px] uppercase tracking-wide text-black/40 mb-4">
                Badge — discount variant
              </p>
              <div className="flex flex-wrap gap-3">
                {discountExamples.map((d) => (
                  <Badge key={d.percent} variant="discount">
                    <span
                      className="inline-block w-[8px] h-[8px] rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    -{d.percent}%
                  </Badge>
                ))}
              </div>
              <Annotation>
                Badge variant=&quot;discount&quot; — colored dot + percentage
              </Annotation>
            </div>

            {/* Badge — nav variant */}
            <div>
              <p className="font-sans font-medium text-[11px] uppercase tracking-wide text-black/40 mb-4">
                Badge — nav variant
              </p>
              <div className="flex gap-3">
                <Badge variant="nav">Close</Badge>
                <Badge variant="nav">Favorites</Badge>
              </div>
              <Annotation>
                Badge variant=&quot;nav&quot; — navigation pills
              </Annotation>
            </div>

            {/* Button — chip variant */}
            <div>
              <p className="font-sans font-medium text-[11px] uppercase tracking-wide text-black/40 mb-4">
                Button — chip variant
              </p>
              <div className="flex gap-3">
                <Button variant="chip" className="px-[14px] py-[7px]">
                  Category
                </Button>
                <Button variant="chip" className="px-[14px] py-[7px]">
                  Min. Discount
                </Button>
                <Button variant="chip" className="px-[14px] py-[7px]">
                  Brands
                </Button>
              </div>
              <Annotation>
                Button variant=&quot;chip&quot; — mobile filter chips
              </Annotation>
            </div>

            {/* Slider — discount slider */}
            <div>
              <p className="font-sans font-medium text-[11px] uppercase tracking-wide text-black/40 mb-4">
                Slider — discount filter
              </p>
              <div className="max-w-[300px]">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-sans font-medium text-[12px] uppercase">
                    Min. Discount
                  </span>
                  <span className="font-serif text-[14px]">
                    {sliderValue[0]}%
                  </span>
                </div>
                <div
                  className="discount-slider"
                  style={
                    {
                      "--thumb-color": getThumbColor(sliderValue[0]),
                    } as React.CSSProperties
                  }
                >
                  <Slider
                    min={20}
                    max={60}
                    step={1}
                    value={sliderValue}
                    onValueChange={setSliderValue}
                  />
                </div>
              </div>
              <Annotation>
                Slider min=20 max=60 — thumb color changes with value
              </Annotation>
            </div>

            {/* DropdownMenu — category dropdown */}
            <div>
              <p className="font-sans font-medium text-[11px] uppercase tracking-wide text-black/40 mb-4">
                DropdownMenu — category filter
              </p>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button className="font-sans font-medium text-[12px] uppercase cursor-pointer flex items-center gap-1">
                    Category
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                      className="ml-1"
                    >
                      <path
                        d="M1 1L5 5L9 1"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="category-dropdown min-w-[160px]"
                >
                  {["All", "Clothing", "Shoes", "Accessories"].map((cat) => (
                    <DropdownMenuItem
                      key={cat}
                      className="font-sans text-[12px] uppercase cursor-pointer"
                    >
                      {cat}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Annotation>
                DropdownMenu modal=false — category-dropdown animation class
              </Annotation>
            </div>

            {/* Drawer — bottom sheet */}
            <div>
              <p className="font-sans font-medium text-[11px] uppercase tracking-wide text-black/40 mb-4">
                Drawer — mobile bottom sheet
              </p>
              <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button variant="chip" className="px-[14px] py-[7px]">
                    Open Drawer
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerTitle className="sr-only">Sample Drawer</DrawerTitle>
                  <div className="p-6 space-y-4">
                    <p className="font-sans font-medium text-[12px] uppercase tracking-wide text-black/40">
                      Category
                    </p>
                    {["All", "Clothing", "Shoes", "Accessories"].map((cat) => (
                      <button
                        key={cat}
                        className="block w-full text-left font-sans text-[14px] uppercase py-2 cursor-pointer"
                        onClick={() => setDrawerOpen(false)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </DrawerContent>
              </Drawer>
              <Annotation>
                Drawer — bottom sheet with handle bar, swipe to dismiss
              </Annotation>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
