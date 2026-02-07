import fs from "fs";
import path from "path";
import LookbookImages from "./_components/LookbookImages";

export default function Home() {
  const dir = path.join(process.cwd(), "public", "lookbook");
  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
    .sort();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-white">
      <LookbookImages files={files} />
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <img src="/brand/ALMANAC.svg" alt="ALMANAC" />
          <p className="text-center font-sans text-[16px] text-black">
            Curated fashion sales from independent European boutiques
          </p>
          <span className="bg-black/[0.04] px-2 py-1 font-mono text-[11px] uppercase text-black/50">
            IN PRIVATE DEVELOPMENT
          </span>
        </div>
      </div>
    </div>
  );
}
