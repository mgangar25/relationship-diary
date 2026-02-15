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

function getNext27th() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  let next = new Date(year, month, 27);

  if (today.getDate() >= 27) {
    next = new Date(year, month + 1, 27);
  }

  return next;
}

function getNextAnniversary() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const anniversary = new Date(currentYear, 11, 27); // December 27

  if (today > anniversary) {
    return new Date(currentYear + 1, 11, 27);
  }

  return anniversary;
}

export default function Timeline() {
  const next27th = useMemo(() => getNext27th(), []);
  const nextAnniversary = useMemo(() => getNextAnniversary(), []);

  const milestones: Milestone[] = [
    {
      title: "Together begins",
      subtitle: "Our journey starts 💖",
      date: RELATIONSHIP_START,
    },
    {
      title: "Anniversary 🎉",
      subtitle: "December 27",
      date: formatDate(nextAnniversary),
    },
    {
      title: "Malay’s Birthday 🎂",
      date: "2026-08-25",
    },
    {
      title: "Shruti’s Birthday 🎂",
      date: "2026-09-01",
    },
  ];

  return (
    <div className="card relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold">
            Milestones
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            The important dates that matter to us ✨
          </p>
        </div>

        {/* NEXT UP BOX */}
        <div className="px-5 py-4 rounded-2xl border border-purple-400/30 bg-purple-500/10 backdrop-blur">
          <p className="text-sm text-gray-400">Next up</p>
          <p className="font-semibold text-purple-400">
            Monthly Milestone 💕
          </p>
          <p className="text-sm text-gray-400">
            {formatDate(next27th)}
          </p>
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {milestones.map((m, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-5 rounded-2xl border border-white/10 bg-white/5"
          >
            <div>
              <p className="font-medium">{m.title}</p>
              {m.subtitle && (
                <p className="text-sm text-gray-400">
                  {m.subtitle}
                </p>
              )}
            </div>

            <p className="text-gray-400 text-sm">
              {m.date}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
