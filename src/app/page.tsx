"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

import QuoteOfDay from "@/components/QuoteOfDay";
import UnreadPreview from "@/components/UnreadPreview";
import Timeline from "@/components/Timeline";
import GoalsTracker from "@/components/GoalsTracker";

/* ================= TYPES ================= */

type MoodType = {
  userEmail: string;
  mood: string;
};

type EntryType = {
  title: string;
  body: string;
  createdAt?: Timestamp;
};

type ReminderType = {
  id: string;
  title: string;
  date: string;
};

/* ================= PAGE ================= */

export default function HomePage() {
  const [moods, setMoods] = useState<MoodType[]>([]);
  const [latestEntry, setLatestEntry] = useState<EntryType | null>(null);
  const [reminders, setReminders] = useState<ReminderType[]>([]);

  const relationshipStartDate = "2025-12-27";

  /* ================= DAYS TOGETHER ================= */

  const daysTogether = useMemo(() => {
    const start = new Date(relationshipStartDate);
    const today = new Date();
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return Math.max(
      Math.floor(
        (today.getTime() - start.getTime()) /
          (1000 * 60 * 60 * 24)
      ),
      0
    );
  }, []);

  /* ================= MONTH MILESTONE ================= */

  function getMonthsCompleted(startDate: string) {
    const start = new Date(startDate);
    const now = new Date();

    let months =
      (now.getFullYear() - start.getFullYear()) * 12 +
      (now.getMonth() - start.getMonth());

    if (now.getDate() < 27) months -= 1;

    return months > 0 ? months : 0;
  }

  const today = new Date();
  const isMilestoneDay = today.getDate() === 27;
  const isAnniversary =
    today.getDate() === 27 && today.getMonth() === 11;

  const monthsCompleted = getMonthsCompleted(
    relationshipStartDate
  );

  /* ================= MOODS ================= */

  useEffect(() => {
    const q = query(collection(db, "moods"));

    const unsub = onSnapshot(q, (snap) => {
      const data: MoodType[] = snap.docs.map(
        (doc) => doc.data() as MoodType
      );
      setMoods(data);
    });

    return () => unsub();
  }, []);

  /* ================= LATEST ENTRY ================= */

  useEffect(() => {
    const q = query(
      collection(db, "diaryEntries"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setLatestEntry(
          snap.docs[0].data() as EntryType
        );
      } else {
        setLatestEntry(null);
      }
    });

    return () => unsub();
  }, []);

  /* ================= UPCOMING REMINDERS ================= */

  useEffect(() => {
    const todayStr = new Date()
      .toISOString()
      .split("T")[0];

    const q = query(
      collection(db, "events"),
      where("date", ">=", todayStr),
      orderBy("date", "asc"),
      limit(5)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data: ReminderType[] = snap.docs.map(
        (doc) => {
          const d = doc.data() as DocumentData;

          return {
            id: doc.id,
            title: String(d.title ?? ""),
            date: String(d.date ?? ""),
          };
        }
      );

      setReminders(data);
    });

    return () => unsub();
  }, []);

  /* ================= MOOD VALUES ================= */

  const malayMood =
    moods.find(
      (m) =>
        m.userEmail ===
        "malaygangar06@gmail.com"
    )?.mood ?? "No mood yet";

  const shrutiMood =
    moods.find(
      (m) =>
        m.userEmail ===
        "shrutikadam103@gmail.com"
    )?.mood ?? "No mood yet";

  /* ================= UI ================= */

  return (
    <div className="space-y-10">

      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="card glass relative overflow-hidden"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-gradient">
          Malay ❤️ Shruti
        </h1>

        <p className="mt-3 text-gray-600 dark:text-gray-300 text-lg">
          Our private space for memories,
          love letters, and little moments.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white/60 dark:bg-slate-800/50 border border-pink-100 dark:border-white/10">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Days together
            </p>
            <p className="text-2xl font-bold">
              {daysTogether} ✨
            </p>
          </div>

          <Link
            href="/calendar"
            className="btn btn-secondary"
          >
            View Calendar
          </Link>

          <Link
            href="/letters"
            className="btn btn-primary"
          >
            Open Letters
          </Link>
        </div>
      </motion.div>

      {/* ANNIVERSARY */}
      {isAnniversary && (
        <div className="card text-center">
          <h2 className="text-4xl font-extrabold text-gradient mb-2">
            🎉 Happy Anniversary!
          </h2>
          <p>
            Another beautiful year together 💖
          </p>
        </div>
      )}

      {/* MONTHLY MILESTONE */}
      {isMilestoneDay && !isAnniversary && (
        <div className="card text-center">
          <h2 className="text-3xl font-bold text-gradient mb-2">
            💖 Milestone Day
          </h2>
          <p>
            {monthsCompleted} months together today ✨
          </p>
        </div>
      )}

      {/* UPCOMING REMINDERS */}
      {reminders.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">
            📅 Upcoming Reminders
          </h2>

          <div className="space-y-3">
            {reminders.map((r) => (
              <div
                key={r.id}
                className="flex justify-between items-center p-4 rounded-xl bg-white/60 dark:bg-slate-800/50 border border-pink-100 dark:border-white/10"
              >
                <span>{r.title}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {r.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MOODS + QUOTE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold">
            Today’s Mood
          </h2>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <MoodCard name="Malay" mood={malayMood} />
            <MoodCard name="Shruti" mood={shrutiMood} />
          </div>

          <div className="mt-5">
            <Link
              href="/mood"
              className="btn btn-primary"
            >
              Update Mood
            </Link>
          </div>
        </div>

        <QuoteOfDay />
      </div>

      {/* ACTIONS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Link href="/diary/new" className="action-card">
          ✍️ Write Entry
        </Link>
        <Link href="/memories/new" className="action-card">
          📸 Add Memory
        </Link>
        <Link href="/letters/new" className="action-card">
          💌 Write Letter
        </Link>
        <Link href="/calendar" className="action-card">
          📅 Calendar
        </Link>
      </div>

      {/* MID ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UnreadPreview />

        <div className="card">
          <h2 className="text-xl font-semibold">
            Latest Diary Entry
          </h2>

          <div className="mt-5">
            {latestEntry ? (
              <>
                <p className="font-semibold text-lg">
                  {latestEntry.title}
                </p>
                <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-3">
                  {latestEntry.body}
                </p>
                <div className="mt-4">
                  <Link
                    href="/diary"
                    className="text-sm font-medium rd-accent-text"
                  >
                    View all entries →
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No entries yet.
              </p>
            )}
          </div>
        </div>
      </div>

      <Timeline />
      <GoalsTracker />
    </div>
  );
}

/* ================= MOOD CARD ================= */

function MoodCard({
  name,
  mood,
}: {
  name: string;
  mood: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-2xl border border-pink-100 dark:border-white/10 bg-white/60 dark:bg-slate-800/60 backdrop-blur px-5 py-4"
    >
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {name}
      </p>
      <p className="mt-2 text-2xl font-bold rd-accent-text">
        {mood}
      </p>
    </motion.div>
  );
}
