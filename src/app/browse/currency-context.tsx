"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "almanac-currency";

interface CurrencyState {
  currency: string;
  setCurrency: (code: string) => void;
  convertPrice: (amount: number | null, fromCurrency: string | null) => number | null;
}

const CurrencyContext = createContext<CurrencyState | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyRaw] = useState("EUR");
  const [rates, setRates] = useState<Record<string, number> | null>(null);

  // Restore from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setCurrencyRaw(stored);
    } catch {}
  }, []);

  const setCurrency = useCallback((code: string) => {
    setCurrencyRaw(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {}
  }, []);

  // Fetch exchange rates once on mount
  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/EUR")
      .then((res) => res.json())
      .then((data) => {
        if (data?.result === "success" && data.rates && typeof data.rates === "object") {
          setRates(data.rates as Record<string, number>);
        }
      })
      .catch(() => {});
  }, []);

  const convertPrice = useCallback(
    (amount: number | null, fromCurrency: string | null): number | null => {
      if (amount == null) return null;
      const from = (fromCurrency ?? "EUR").toUpperCase();
      const to = currency.toUpperCase();
      if (from === to) return amount;
      if (!rates) return amount; // no rates yet — show original

      // Convert: from → EUR → to
      const fromRate = from === "EUR" ? 1 : rates[from];
      const toRate = to === "EUR" ? 1 : rates[to];
      if (!fromRate || !toRate) return amount;

      const inEur = amount / fromRate;
      return Math.round(inEur * toRate);
    },
    [currency, rates]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
