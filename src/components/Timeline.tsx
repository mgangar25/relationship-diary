"use client";

import { useMemo } from "react";

const QUOTES = [
  "Us, always. 💞",
  "Every little moment with you matters.",
  "Love is the tiny things done daily.",
  "My favorite place is next to you.",
  "Soft hearts. Strong love.",
  "Even ordinary days feel special with you.",
  "We’re building a lifetime, one day at a time.",
  "I choose you. Again and again.",
];

function dayOfYear(d: Date) {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function QuoteOfDay() {
  const quote = useMemo(() => {
    const i = dayOfYear(new Date()) % QUOTES.length;
    return QUOTES[i];
  }, []);

  return (
    <div className="card glass relative overflow-hidden">
      <div className="absolute -top-20 -left-20 h-56 w-56 rounded-full bg-pink-300/20 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-purple-300/20 blur-3xl" />

      <p className="text-sm text-gray-500 dark:text-gray-400">Quote of the day</p>
      <p className="mt-2 text-xl md:text-2xl font-semibold text-gray-800 dark:text-white">
        {quote}
      </p>
    </div>
  );
}
