import { Footer } from "@/app/browse/footer";
import { CurrencyProvider } from "@/app/browse/currency-context";
import { CurrencyPicker } from "@/app/browse/currency-picker";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
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
            About Almanac
          </h1>
          <div className="mt-[16px] space-y-[16px]">
            <p className="font-serif text-[17px] leading-[1.6]">
              Almanac is a curated platform for contemporary fashion, bringing
              together discounted pieces from selected boutiques across Europe.
            </p>
            <p className="font-serif text-[17px] leading-[1.6]">
              The goal is simple: make it easier to discover well-designed
              clothing from brands that value craftsmanship, materials, and
              thoughtful design. Instead of browsing dozens of stores, Almanac
              highlights a considered selection of pieces currently available
              below retail.
            </p>
            <p className="font-serif text-[17px] leading-[1.6]">
              From Scandinavian minimalism to Japanese craftsmanship and
              everything in between, Almanac focuses on brands that balance
              timeless design with modern sensibilities.
            </p>
          </div>

          <h2 className="mt-[48px] font-serif text-[22px] leading-[1.3] font-semibold">
            How Almanac works
          </h2>
          <div className="mt-[16px] space-y-[16px]">
            <p className="font-serif text-[17px] leading-[1.6]">
              Almanac curates products that are currently on sale across a range
              of boutiques and retailers.
            </p>
            <p className="font-serif text-[17px] leading-[1.6]">
              When you click on a product, you will be redirected to the
              retailer&apos;s website where the purchase is completed.
            </p>
            <p className="font-serif text-[17px] leading-[1.6]">
              Almanac does not sell products directly and does not handle
              payment, shipping, or returns. All purchases are made with the
              respective retailer.
            </p>
          </div>

          <h2 className="mt-[48px] font-serif text-[22px] leading-[1.3] font-semibold">
            Affiliate disclosure
          </h2>
          <div className="mt-[16px] space-y-[16px]">
            <p className="font-serif text-[17px] leading-[1.6]">
              Links on Almanac are affiliate links. If you purchase through
              these links, Almanac may earn a commission at no additional cost to
              you.
            </p>
            <p className="font-serif text-[17px] leading-[1.6]">
              This helps support the platform and allows us to continue curating
              products from selected boutiques.
            </p>
          </div>
        </main>
      </div>
      <Footer />
    </CurrencyProvider>
  );
}
