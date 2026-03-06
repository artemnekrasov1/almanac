import { Footer } from "@/app/browse/footer";
import { CurrencyProvider } from "@/app/browse/currency-context";
import { CurrencyPicker } from "@/app/browse/currency-picker";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>

          <h2 className="mt-[48px] font-serif text-[22px] leading-[1.3] font-semibold">
            General information
          </h2>
          <div className="mt-[16px] space-y-[16px]">
            <p className="font-serif text-[17px] leading-[1.6]">
              Protecting your personal data is important to us. This privacy
              policy explains how personal data is processed when you visit this
              website.
            </p>
            <p className="font-serif text-[17px] leading-[1.6]">
              The controller responsible for data processing is:
            </p>
            <div className="space-y-[4px]">
              <p className="font-serif text-[17px] leading-[1.6]">
                Artem Nekrasov
              </p>
              <p className="font-serif text-[17px] leading-[1.6]">
                Senefelderstr. 23
              </p>
              <p className="font-serif text-[17px] leading-[1.6]">
                10437 Berlin
              </p>
              <p className="font-serif text-[17px] leading-[1.6]">Germany</p>
              <p className="font-serif text-[17px] leading-[1.6]">
                Email:{" "}
                <a
                  href="mailto:hello@almanac.clothing"
                  className="underline"
                >
                  hello@almanac.clothing
                </a>
              </p>
            </div>
          </div>

          <h2 className="mt-[48px] font-serif text-[22px] leading-[1.3] font-semibold">
            Server log files
          </h2>
          <div className="mt-[16px] space-y-[16px]">
            <p className="font-serif text-[17px] leading-[1.6]">
              When you visit this website, the hosting provider automatically
              collects and stores information in so-called server log files. This
              may include:
            </p>
            <ul className="font-serif text-[17px] leading-[1.6] list-disc pl-[24px] space-y-[4px]">
              <li>IP address</li>
              <li>date and time of access</li>
              <li>browser type and version</li>
              <li>operating system</li>
              <li>referring URL</li>
            </ul>
            <p className="font-serif text-[17px] leading-[1.6]">
              This data is used to ensure the secure and stable operation of the
              website.
            </p>
            <p className="font-serif text-[17px] leading-[1.6]">
              The legal basis for this processing is Art. 6(1)(f) GDPR
              (legitimate interest).
            </p>
          </div>

          <h2 className="mt-[48px] font-serif text-[22px] leading-[1.3] font-semibold">
            Hosting
          </h2>
          <div className="mt-[16px] space-y-[16px]">
            <p className="font-serif text-[17px] leading-[1.6]">
              This website is hosted by Vercel Inc., 440 N Barranca Ave #4133,
              Covina, CA 91723, USA.
            </p>
            <p className="font-serif text-[17px] leading-[1.6]">
              Vercel processes technical data necessary for the operation and
              delivery of the website.
            </p>
            <p className="font-serif text-[17px] leading-[1.6]">
              Further information can be found in Vercel&apos;s privacy policy:{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                https://vercel.com/legal/privacy-policy
              </a>
            </p>
          </div>

          <h2 className="mt-[48px] font-serif text-[22px] leading-[1.3] font-semibold">
            Database services
          </h2>
          <div className="mt-[16px] space-y-[16px]">
            <p className="font-serif text-[17px] leading-[1.6]">
              This website uses Supabase Inc. as a database provider to store and
              manage application data.
            </p>
            <p className="font-serif text-[17px] leading-[1.6]">
              Supabase may process technical information necessary to provide the
              service.
            </p>
            <p className="font-serif text-[17px] leading-[1.6]">
              Further information can be found in Supabase&apos;s privacy
              policy:{" "}
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                https://supabase.com/privacy
              </a>
            </p>
          </div>

          <h2 className="mt-[48px] font-serif text-[22px] leading-[1.3] font-semibold">
            External links
          </h2>
          <div className="mt-[16px]">
            <p className="font-serif text-[17px] leading-[1.6]">
              This website contains links to external websites operated by third
              parties. We have no influence over the content or privacy practices
              of those websites.
            </p>
          </div>

          <h2 className="mt-[48px] font-serif text-[22px] leading-[1.3] font-semibold">
            Affiliate links
          </h2>
          <div className="mt-[16px] space-y-[16px]">
            <p className="font-serif text-[17px] leading-[1.6]">
              Some links on this website may redirect to external retailers. If a
              purchase is made through such links, we may receive a commission.
            </p>
            <p className="font-serif text-[17px] leading-[1.6]">
              These links simply redirect users to the retailer&apos;s website
              where the purchase takes place.
            </p>
          </div>

          <h2 className="mt-[48px] font-serif text-[22px] leading-[1.3] font-semibold">
            Your rights
          </h2>
          <div className="mt-[16px] space-y-[16px]">
            <p className="font-serif text-[17px] leading-[1.6]">
              Under the GDPR, you have the following rights:
            </p>
            <ul className="font-serif text-[17px] leading-[1.6] list-disc pl-[24px] space-y-[4px]">
              <li>the right to access your personal data (Art. 15 GDPR)</li>
              <li>the right to rectification (Art. 16 GDPR)</li>
              <li>the right to erasure (Art. 17 GDPR)</li>
              <li>the right to restriction of processing (Art. 18 GDPR)</li>
              <li>the right to data portability (Art. 20 GDPR)</li>
              <li>the right to object to processing (Art. 21 GDPR)</li>
            </ul>
            <p className="font-serif text-[17px] leading-[1.6]">
              To exercise these rights, you can contact us using the email
              address listed above.
            </p>
          </div>

          <h2 className="mt-[48px] font-serif text-[22px] leading-[1.3] font-semibold">
            Right to lodge a complaint
          </h2>
          <div className="mt-[16px]">
            <p className="font-serif text-[17px] leading-[1.6]">
              You have the right to lodge a complaint with a data protection
              supervisory authority if you believe that the processing of your
              personal data violates applicable data protection law.
            </p>
          </div>
        </main>
      </div>
      <Footer />
    </CurrencyProvider>
  );
}
