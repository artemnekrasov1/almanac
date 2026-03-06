import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer
      className="sticky bottom-0 z-0 bg-cover bg-center"
      style={{ backgroundImage: "url(/bg/bg-concrete.jpg)" }}
    >
      {/* Logo + Links — stacked below xl, side-by-side at xl+ */}
      <div className="flex flex-col justify-end p-[16px] gap-[16px] h-[200px] xl:h-[256px] xl:relative xl:p-0">
        <img
          src="/brand/Almanac.svg"
          alt="Almanac"
          className="h-[56px] xl:h-[94px] w-auto self-start xl:absolute xl:bottom-[32px] xl:left-[32px]"
        />
        <div className="flex flex-wrap gap-x-[24px] gap-y-[8px] xl:absolute xl:bottom-[32px] xl:right-[32px]">
          <Button variant="ghost-link" size="none" asChild>
            <a href="/about">About</a>
          </Button>
          <Button variant="ghost-link" size="none" asChild>
            <a href="mailto:hello@almanac.clothing">hello@almanac.clothing</a>
          </Button>
          <Button variant="ghost-link" size="none" asChild>
            <a href="/impressum">Impressum</a>
          </Button>
          <Button variant="ghost-link" size="none" asChild>
            <a href="/privacy">Privacy Policy</a>
          </Button>
        </div>
      </div>
    </footer>
  );
}
