"use client";

import { useMemo } from "react";

type Milestone = {
  date: string; // YYYY-MM-DD
  title: string;
  subtitle?: string;
};

function toDate(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day, 0, 0, 0, 0);
}

export default function Timeline() {
  const milestones = useMemo<Milestone[]>(
    () => [
      { date: "2025-12-27", title: "Together begins", subtitle: "Our journey starts 💖" },
      { date: "2026-08-25", title: "Malay’s Birthday", subtitle: "🎂" },
      { date: "2026-09-01", title: "Shruti’s Birthday", subtitle: "🎂" },
    ],
    []
  );

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const nextUp = useMemo(() => {
    const future = milestones
      .map((m) => ({ ...m, dt: toDate(m.date) }))
      .filter((m) => m.dt.getTime() >= today.getTime())
      .sort((a, b) => a.dt.getTime() - b.dt.getTime());
    return future[0] ?? null;
  }, [milestones, today]);

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-xl font-semibold">Milestones</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            The important dates that matter to us ✨
          </p>
        </div>

        {nextUp && (
          <div className="rounded-2xl px-4 py-3 bg-pink-50 dark:bg-pink-900/20 border border-pink-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Next up</p>
            <p className="font-semibold text-gray-800 dark:text-white">{nextUp.title}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{nextUp.date}</p>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {milestones
          .slice()
          .sort((a, b) => toDate(a.date).getTime() - toDate(b.date).getTime())
          .map((m) => (
            <div
              key={m.date}
              className="flex items-center gap-4 rounded-2xl border border-pink-100 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 backdrop-blur px-4 py-3"
            >
              <div className="h-3 w-3 rounded-full bg-pink-500 shadow" />
              <div className="flex-1">
                <p className="font-semibold">{m.title}</p>
                {m.subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{m.subtitle}</p>
                )}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {m.date}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
