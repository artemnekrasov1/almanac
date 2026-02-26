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
  const [pinned, setPinned] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      if (window.innerWidth >= LG) {
        setPinned(false);
        return;
      }
      const y = window.scrollY;
      const scrollingUp = y < lastY.current;
      setPinned(y > HEADER_H && scrollingUp);
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
    <HeaderContext value={pinned}>
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
  const pinned = useHeaderPinned();
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
      {/* ── Mobile: in-flow header ── */}
      <motion.nav
        className="lg:hidden bg-white flex items-center justify-between px-[24px] py-6 z-30"
        initial={{ opacity: 0 }}
        animate={contentReady ? { opacity: 1 } : {}}
        transition={{ duration: 0.4 }}
      >
        {mobileLogo}
        {badges}
      </motion.nav>

      {/* ── Mobile: fixed header on scroll-up ── */}
      <nav
        className={`lg:hidden fixed top-0 left-0 right-0 z-40 bg-white flex items-center justify-between px-[24px] py-6 transition-transform duration-200 ${
          pinned ? "translate-y-0" : "-translate-y-full pointer-events-none"
        }`}
        aria-hidden={!pinned}
      >
        {mobileLogo}
        {badges}
      </nav>

      {/* ── Desktop: badges (not sticky) ── */}
      <motion.div
        className="hidden lg:block absolute top-[24px] right-[32px] z-50"
        initial={{ opacity: 0, y: 8 }}
        animate={contentReady ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.5 }}
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
            <p className="text-[32px] font-serif font-medium leading-[1.25]">
              {SENTENCE_WORDS.map((word, i) => (
                <motion.span
                  key={i}
                  className={i === 0 ? "italic" : undefined}
                  initial={{ opacity: 0, filter: "blur(10px)" }}
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
            className="absolute top-0 left-0 text-[32px] font-serif font-medium italic leading-[1.25]"
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: WORD_DURATION, ease: "easeOut" }}
          >
            Almanac
          </motion.span>
        </div>
      </div>
    </>
  );
}

/* ── AnimatedContent wrapper for server-component page ── */

export function AnimatedContent({ children }: { children: React.ReactNode }) {
  const ready = useContentReady();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={ready ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
