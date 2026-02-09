export default function Home() {
  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{
        backgroundImage: "url('/bg/bg-concrete.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center px-[24px]">
        <div className="flex w-full max-w-[340px] flex-col items-center">
          <img src="/brand/ALMANAC.svg" alt="ALMANAC" className="w-full" />
          <p className="mt-[32px] text-center font-mono text-[16px] text-black">
            Curated fashion sales from independent European boutiques
          </p>
          <a
            href="mailto:hello@almanac.clothing"
            className="mt-[80px] font-mono text-[16px] text-black"
          >
            hello@almanac.clothing
          </a>
        </div>
      </div>
    </div>
  );
}
