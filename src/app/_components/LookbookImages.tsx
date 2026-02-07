"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

const SLOTS = [
  { style: { top: "-3%", left: "0%" }, w: 215, h: 265, depth: 0.9 },
  { style: { top: "8%", left: "28%" }, w: 140, h: 175, depth: 0.4 },
  { style: { top: "-5%", right: "24%" }, w: 180, h: 220, depth: 0.7 },
  { style: { top: "6%", right: "-2%" }, w: 200, h: 250, depth: 0.8 },
  { style: { top: "33%", left: "1%" }, w: 155, h: 200, depth: 0.6 },
  { style: { top: "45%", right: "3%" }, w: 135, h: 180, depth: 0.5 },
  { style: { bottom: "-2%", left: "1%" }, w: 195, h: 245, depth: 0.8 },
  { style: { bottom: "6%", left: "26%" }, w: 145, h: 180, depth: 0.5 },
  { style: { bottom: "-4%", right: "26%" }, w: 170, h: 210, depth: 0.7 },
  { style: { bottom: "-5%", right: "-1%" }, w: 210, h: 260, depth: 0.9 },
];

const MAX_OFFSET = 8;
const LERP = 0.05;

// Deterministic shuffle so images land in different slots
const ORDER = [4, 9, 1, 7, 5, 3, 8, 0, 6, 2];

export default function LookbookImages({ files }: { files: string[] }) {
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef(SLOTS.map(() => ({ x: 0, y: 0 })));
  const rafRef = useRef(0);

  const images = ORDER.map((i) => files[i]).filter(Boolean).slice(0, SLOTS.length);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const animate = () => {
      const { x, y } = mouseRef.current;
      imageRefs.current.forEach((el, i) => {
        if (!el) return;
        const { depth } = SLOTS[i];
        const cur = currentRef.current[i];
        cur.x += (x * MAX_OFFSET * depth - cur.x) * LERP;
        cur.y += (y * MAX_OFFSET * depth - cur.y) * LERP;
        el.style.transform = `translate(${cur.x}px, ${cur.y}px)`;
      });
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMouseMove);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 hidden md:block">
      {images.map((file, i) => {
        const slot = SLOTS[i];
        return (
          <div
            key={file}
            ref={(el) => {
              imageRefs.current[i] = el;
            }}
            className="absolute overflow-hidden"
            style={{
              ...slot.style,
              width: slot.w,
              height: slot.h,
              willChange: "transform",
            }}
          >
            <Image
              src={`/lookbook/${file}`}
              alt=""
              fill
              sizes={`${slot.w}px`}
              className="object-cover"
            />
          </div>
        );
      })}
    </div>
  );
}
