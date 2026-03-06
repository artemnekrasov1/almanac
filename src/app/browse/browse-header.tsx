"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion } from "motion/react";

/* ── Shared context so mobile filter chips know when the header is pinned ── */

const HeaderContext = createContext(false);
export const useHeaderPinned = () => useContext(HeaderContext);

/* ── Load animation context ── */

const LoadAnimationContext = createContext(false);
export const useContentReady = () => useContext(LoadAnimationContext);

const HEADER_H = 72;
const LG = 1024;

export function HeaderProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const [contentReady, setContentReady] = useState(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).has("pdp");
  });
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      if (window.innerWidth >= LG) {
        setHidden(false);
        return;
      }
      const y = window.scrollY;
      const scrollingUp = y < lastY.current;
      setHidden(y > HEADER_H && !scrollingUp);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Lock scrolling until the entrance animation finishes */
  useEffect(() => {
    if (contentReady) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [contentReady]);

  /* On mobile the desktop sentence is hidden so onAnimationComplete never
     fires. Trigger contentReady after a short delay on narrow viewports. */
  useEffect(() => {
    if (contentReady) return;
    if (window.innerWidth >= LG) return;
    const id = setTimeout(() => setContentReady(true), 100);
    return () => clearTimeout(id);
  }, [contentReady]);

  return (
    <HeaderContext value={!hidden}>
      <LoadAnimationContext value={contentReady}>
        <SetContentReadyContext value={setContentReady}>
          {children}
        </SetContentReadyContext>
      </LoadAnimationContext>
    </HeaderContext>
  );
}

const SetContentReadyContext = createContext<(v: boolean) => void>(() => {});

/* ── Header component ── */

const FADE_DISTANCE = 50;
const COMPACT_H = 80;

const SENTENCE_WORDS =
  "Almanac is a curated selection of contemporary fashion. Always below retail.".split(
    " "
  );
const WORD_DURATION = 0.6;
const WORD_STAGGER = 0.08;

export function BrowseHeader({
  mobileLogo,
  badges,
}: {
  mobileLogo: React.ReactNode;
  badges: React.ReactNode;
}) {
  const contentReady = useContext(LoadAnimationContext);
  const setContentReady = useContext(SetContentReadyContext);
  const [fadeProgress, setFadeProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (window.innerWidth < LG) return;
      setFadeProgress(Math.min(1, window.scrollY / FADE_DISTANCE));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ── Mobile: sticky header (hide on scroll-down, show on scroll-up) ── */}
      <MobileStickyNav contentReady={contentReady}>
        {mobileLogo}
        {badges}
      </MobileStickyNav>

      {/* ── Desktop: badges (not sticky) ── */}
      <motion.div
        className="hidden lg:block absolute top-[24px] right-[32px] z-50"
        initial={contentReady ? false : { opacity: 0, y: 8 }}
        animate={contentReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={contentReady ? { duration: 0.4, delay: 0.15 } : { duration: 0 }}
      >
        {badges}
      </motion.div>

      {/* ── Desktop: sticky header with fade-to-Almanac ── */}
      <div
        className="hidden lg:flex items-start px-[32px] pt-[24px] pb-[24px] sticky top-0 z-40"
        style={{
          height: COMPACT_H,
          overflow: fadeProgress >= 1 ? "hidden" : "visible",
        }}
      >
        <div className="relative max-w-[640px]">
          {/* Layer 1: full text — word-by-word blur-in, then fades out on scroll */}
          <div style={{ opacity: 1 - fadeProgress }}>
            <p className="text-[32px] font-serif font-normal leading-[1.25]">
              {SENTENCE_WORDS.map((word, i) => (
                <motion.span
                  key={i}
                  className={i === 0 ? "italic" : undefined}
                  initial={contentReady ? false : { opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{
                    duration: WORD_DURATION,
                    delay: i * WORD_STAGGER,
                    ease: "easeOut",
                  }}
                  onAnimationComplete={
                    i === SENTENCE_WORDS.length - 1
                      ? () => setContentReady(true)
                      : undefined
                  }
                >
                  {word}{" "}
                </motion.span>
              ))}
            </p>
          </div>
          {/* Layer 2: "Almanac" only — always visible */}
          <motion.span
            className="absolute top-0 left-0 text-[32px] font-serif font-normal italic leading-[1.25]"
            initial={contentReady ? false : { opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={contentReady ? { duration: 0 } : { duration: WORD_DURATION, ease: "easeOut" }}
          >
            Almanac
          </motion.span>
        </div>
      </div>
    </>
  );
}

/* ── Mobile sticky nav ── */

function MobileStickyNav({
  contentReady,
  children,
}: {
  contentReady: boolean;
  children: React.ReactNode;
}) {
  const pinned = useHeaderPinned();
  const hidden = !pinned;

  return (
    <motion.nav
      className="lg:hidden sticky top-0 z-40 bg-white flex items-center justify-between px-[16px] pt-[24px] pb-[12px] transition-transform duration-200"
      style={{ transform: hidden ? "translateY(-100%)" : "translateY(0)" }}
      initial={contentReady ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={contentReady ? { duration: 0 } : { duration: 0.4 }}
    >
      {children}
    </motion.nav>
  );
}

/* ── AnimatedContent wrapper for server-component page ── */

export function AnimatedContent({ children }: { children: React.ReactNode }) {
  const ready = useContentReady();
  const [wasReady] = useState(() => ready);

  return (
    <motion.div
      initial={wasReady ? false : { opacity: 0, y: 8 }}
      animate={wasReady || ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      transition={wasReady ? { duration: 0 } : { duration: 0.5, delay: 0.15 }}
    >
      {children}
    </motion.div>
  );
}
