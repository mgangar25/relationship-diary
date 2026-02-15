"use client";

import { useMemo } from "react";

type Heart = {
  id: string;
  left: string;
  sizePx: number;
  delay: string;
  duration: string;
  opacity: number;
};

export default function FloatingHearts() {
  const hearts = useMemo<Heart[]>(() => {
    const base = [
      { left: "6%", sizePx: 10, delay: "0s", duration: "11s", opacity: 0.25 },
      { left: "14%", sizePx: 14, delay: "2s", duration: "13s", opacity: 0.22 },
      { left: "24%", sizePx: 12, delay: "1s", duration: "10s", opacity: 0.18 },
      { left: "38%", sizePx: 9, delay: "3s", duration: "12s", opacity: 0.2 },
      { left: "52%", sizePx: 16, delay: "0.5s", duration: "14s", opacity: 0.22 },
      { left: "66%", sizePx: 11, delay: "2.5s", duration: "12s", opacity: 0.18 },
      { left: "78%", sizePx: 13, delay: "1.5s", duration: "13s", opacity: 0.2 },
      { left: "90%", sizePx: 9, delay: "3.5s", duration: "11s", opacity: 0.18 },
    ];

    return base.map((h, i) => ({
      ...h,
      id: `heart-${i}`,
    }));
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="absolute bottom-[-24px] select-none rd-heart-float"
          style={{
            left: h.left,
            fontSize: `${h.sizePx}px`,
            opacity: h.opacity,
            animationDelay: h.delay,
            animationDuration: h.duration,
          }}
        >
          💗
        </span>
      ))}
    </div>
  );
}
