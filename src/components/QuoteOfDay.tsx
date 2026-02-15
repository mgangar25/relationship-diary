"use client";

import { useMemo } from "react";

/* ===============================
   BASE PHRASES (building blocks)
   These generate 500+ combinations
================================= */

const OPENINGS = [
  "Us, always.",
  "With you,",
  "Every day,",
  "In this life,",
  "No matter what,",
  "Through everything,",
  "Since that first moment,",
  "In every season,",
  "Side by side,",
  "Forever and beyond,",
];

const MIDDLES = [
  "love feels effortless",
  "the world feels softer",
  "home feels closer",
  "my heart feels safe",
  "everything feels right",
  "life feels brighter",
  "time feels magical",
  "ordinary days feel special",
  "even silence feels warm",
  "the future feels exciting",
];

const ENDINGS = [
  "because of you.",
  "when you're near.",
  "in your arms.",
  "in your smile.",
  "in our little moments.",
  "in our shared dreams.",
  "in the way we laugh.",
  "in every heartbeat.",
  "in our forever.",
  "in us. 💞",
];

/* ===============================
   GENERATE 500+ QUOTES
================================= */

function generateQuotes(): string[] {
  const quotes: string[] = [];

  for (const a of OPENINGS) {
    for (const b of MIDDLES) {
      for (const c of ENDINGS) {
        quotes.push(`${a} ${b} ${c}`);
      }
    }
  }

  return quotes; // 10 x 10 x 10 = 1000 quotes
}

const QUOTES = generateQuotes();

/* ===============================
   DAY-BASED ROTATION
================================= */

function dayOfYear(d: Date) {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/* ===============================
   COMPONENT
================================= */

export default function QuoteOfDay() {
  const quote = useMemo(() => {
    const i = dayOfYear(new Date()) % QUOTES.length;
    return QUOTES[i];
  }, []);

  return (
    <div className="card glass relative overflow-hidden">
      <div className="absolute -top-20 -left-20 h-56 w-56 rounded-full bg-pink-300/20 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-purple-300/20 blur-3xl" />

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Quote of the day
      </p>

      <p className="mt-2 text-xl md:text-2xl font-semibold text-gray-800 dark:text-white leading-relaxed">
        {quote}
      </p>
    </div>
  );
}
