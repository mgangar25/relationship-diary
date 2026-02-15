"use client";

import { useMemo } from "react";

type Milestone = {
  title: string;
  subtitle?: string;
  date: string;
};

const RELATIONSHIP_START = "2025-12-27";

function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}

function getNextMonthly27(today: Date) {
  const year = today.getFullYear();
  const month = today.getMonth();

  const thisMonth27 = new Date(year, month, 27);

  if (today.getDate() <= 27) {
    return thisMonth27;
  }

  return new Date(year, month + 1, 27);
}

function getNextAnniversary(today: Date) {
  const year = today.getFullYear();
  const anniversary = new Date(year, 11, 27); // Dec 27

  if (today <= anniversary) return anniversary;

  return new Date(year + 1, 11, 27);
}

function getNextBirthday(month: number, day: number, today: Date) {
  const year = today.getFullYear();
  const thisYear = new Date(year, month, day);

  if (today <= thisYear) return thisYear;

  return new Date(year + 1, month, day);
}

export default function Timeline() {
  const today = new Date();

  const milestones = useMemo(() => {
    const next27 = getNextMonthly27(today);
    const nextAnniversary = getNextAnniversary(today);

    const malayBirthday = getNextBirthday(7, 25, today); // Aug 25
    const shrutiBirthday = getNextBirthday(8, 1, today); // Sep 1

    const list: Milestone[] = [
      {
        title: "Together begins",
        subtitle: "Our journey starts 💖",
        date: RELATIONSHIP_START,
      },
      {
        title: "Monthly Milestone 💞",
        subtitle: "Every 27th matters",
        date: formatDate(next27),
      },
      {
        title: "Anniversary 🎉",
        subtitle: "December 27",
        date: formatDate(nextAnniversary),
      },
      {
        title: "Malay’s Birthday 🎂",
        date: formatDate(malayBirthday),
      },
      {
        title: "Shruti’s Birthday 🎂",
        date: formatDate(shrutiBirthday),
      },
    ];

    return list;
  }, []);

  const upcoming = useMemo(() => {
    const future = milestones
      .filter((m) => new Date(m.date) >= today)
      .sort((a, b) => +new Date(a.date) - +new Date(b.date));

    return future[0];
  }, [milestones]);

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold">Milestones</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            The important dates that matter to us ✨
          </p>
        </div>

        {upcoming && (
          <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Next up
            </p>
            <p className="font-semibold">
              {upcoming.title}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {upcoming.date}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {milestones.map((m, i) => (
          <div
            key={i}
            className="flex justify-between items-center p-4 rounded-2xl bg-white/60 dark:bg-slate-800/50 border border-white/10"
          >
            <div>
              <p className="font-semibold">{m.title}</p>
              {m.subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {m.subtitle}
                </p>
              )}
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {m.date}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
