"use client";

import { useEffect, useRef, useState } from "react";
import { useCurrency } from "./currency-context";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

const CURRENCIES = [
  "EUR", "USD", "GBP", "CHF", "SEK", "NOK", "DKK", "PLN", "CZK", "JPY",
];

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    setMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return mobile;
}

export function CurrencyPicker() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Close on outside click (desktop dropdown only)
  useEffect(() => {
    if (!open || isMobile) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, isMobile]);

  const handleSelect = (code: string) => {
    setCurrency(code);
    setOpen(false);
  };

  const currencyButton = (code: string) => (
    <button
      key={code}
      className={`w-full text-left px-[12px] py-[6px] text-[12px] font-sans font-medium uppercase tracking-wide hover:bg-black/5 transition-colors ${
        code === currency ? "text-black" : "text-black/50"
      }`}
      onClick={() => handleSelect(code)}
    >
      {code}
    </button>
  );

  return (
    <div ref={ref} className="relative">
      <Button variant="ghost-link" size="none" onClick={() => setOpen((v) => !v)}>
        {currency}
      </Button>

      {/* Desktop dropdown */}
      {open && !isMobile && (
        <div className="hidden lg:block absolute right-0 top-full mt-[8px] bg-white border border-black/10 rounded-[8px] shadow-lg py-[4px] min-w-[120px] z-50">
          {CURRENCIES.map(currencyButton)}
        </div>
      )}

      {/* Mobile bottom sheet */}
      <Drawer open={open && isMobile} onOpenChange={(o) => !o && setOpen(false)}>
        <DrawerContent>
          <DrawerTitle className="sr-only">Currency</DrawerTitle>
          <div className="px-[20px] pb-[28px] pt-[8px]">
            {CURRENCIES.map(currencyButton)}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
