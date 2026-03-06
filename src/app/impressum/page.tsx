import { Footer } from "@/app/browse/footer";
import { CurrencyProvider } from "@/app/browse/currency-context";
import { CurrencyPicker } from "@/app/browse/currency-picker";
import { Button } from "@/components/ui/button";

export default function ImpressumPage() {
  return (
    <CurrencyProvider>
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
            <Button variant="ghost-link" size="none" asChild>
              <a href="/favorites">Favorites</a>
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
            <Button variant="ghost-link" size="none" asChild>
              <a href="/favorites">Favorites</a>
            </Button>
            <CurrencyPicker />
          </div>
        </header>

        {/* ── Content ── */}
        <main className="max-w-[600px] mx-auto px-[16px] py-[64px] lg:px-0 lg:pb-[120px] flex-1">
          <h1 className="font-serif text-[22px] leading-[1.3] font-semibold">
            Impressum
          </h1>

          <h2 className="mt-[48px] font-serif text-[22px] leading-[1.3] font-semibold">
            Betreiber der Website
          </h2>
          <div className="mt-[16px] space-y-[4px]">
            <p className="font-serif text-[17px] leading-[1.6]">
              Artem Nekrasov
            </p>
            <p className="font-serif text-[17px] leading-[1.6]">
              Senefelderstr. 23
            </p>
            <p className="font-serif text-[17px] leading-[1.6]">
              10437 Berlin
            </p>
            <p className="font-serif text-[17px] leading-[1.6]">Deutschland</p>
          </div>

          <h2 className="mt-[48px] font-serif text-[22px] leading-[1.3] font-semibold">
            Kontakt
          </h2>
          <div className="mt-[16px]">
            <a
              href="mailto:hello@almanac.clothing"
              className="font-serif text-[17px] leading-[1.6] underline"
            >
              hello@almanac.clothing
            </a>
          </div>

          <h2 className="mt-[48px] font-serif text-[22px] leading-[1.3] font-semibold">
            Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
          </h2>
          <div className="mt-[16px] space-y-[4px]">
            <p className="font-serif text-[17px] leading-[1.6]">
              Artem Nekrasov
            </p>
            <p className="font-serif text-[17px] leading-[1.6]">
              Senefelderstr. 23
            </p>
            <p className="font-serif text-[17px] leading-[1.6]">
              10437 Berlin
            </p>
            <p className="font-serif text-[17px] leading-[1.6]">Deutschland</p>
          </div>
        </main>
      </div>
      <Footer />
    </CurrencyProvider>
  );
}
