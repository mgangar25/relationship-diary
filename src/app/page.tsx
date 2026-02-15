"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

import QuoteOfDay from "@/components/QuoteOfDay";
import UnreadPreview from "@/components/UnreadPreview";
import Timeline from "@/components/Timeline";
import GoalsTracker from "@/components/GoalsTracker";

type MoodType = { userEmail: string; mood: string };
type EntryType = { title: string; body: string };

export default function HomePage() {


  const [moods, setMoods] = useState<MoodType[]>([]);
  const [latestEntry, setLatestEntry] = useState<EntryType | null>(null);

  const daysTogether = useMemo(() => {
    const relationshipStart = new Date("2025-12-27");
    const today = new Date();
    relationshipStart.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return Math.max(
      Math.floor((today.getTime() - relationshipStart.getTime()) / (1000 * 60 * 60 * 24)),
      0
    );
  }, []);

  useEffect(() => {
    const q = query(collection(db, "moods"));
    const unsub = onSnapshot(q, (snap) => {
      setMoods(snap.docs.map((doc) => doc.data() as MoodType));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "diaryEntries"), orderBy("createdAt", "desc"), limit(1));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) setLatestEntry(snap.docs[0].data() as EntryType);
      else setLatestEntry(null);
    });
    return () => unsub();
  }, []);

  const malayMood =
    moods.find((m) => m.userEmail === "malaygangar06@gmail.com")?.mood || "No mood yet";

  const shrutiMood =
    moods.find((m) => m.userEmail === "shrutikadam103@gmail.com")?.mood || "No mood yet";

  return (
    <div className="space-y-10">
      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="card glass relative overflow-hidden"
      >
        <div className="absolute -top-20 -left-20 h-56 w-56 rounded-full bg-pink-300/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-purple-300/20 blur-3xl" />

        <h1 className="text-4xl md:text-5xl font-extrabold text-gradient">
          Malay ❤️ Shruti
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-300 text-lg">
          Our private space for memories, love letters, and little moments.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white/60 dark:bg-gray-900/30 border border-pink-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Days together</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{daysTogether} ✨</p>
          </div>

          <Link href="/calendar" className="btn btn-secondary">
            View Calendar
          </Link>

          <Link href="/letters" className="btn btn-primary">
            Open Letters
          </Link>
        </div>
      </motion.div>

      {/* TOP ROW: Mood + Quote */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold">Today’s Mood</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            How we’re feeling right now 💛
          </p>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <MoodCard name="Malay" mood={malayMood} />
            <MoodCard name="Shruti" mood={shrutiMood} />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/mood" className="btn btn-primary">
              Update Mood
            </Link>
          </div>
        </div>

        <QuoteOfDay />
      </div>

      {/* ACTIONS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Link href="/diary/new" className="action-card">✍️ Write Entry</Link>
        <Link href="/memories/new" className="action-card">📸 Add Memory</Link>
        <Link href="/letters/new" className="action-card">💌 Write Letter</Link>
        <Link href="/calendar" className="action-card">📅 Calendar</Link>
      </div>

      {/* MID ROW: Unread + Latest Entry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UnreadPreview />

        <div className="card">
          <h2 className="text-xl font-semibold">Latest Diary Entry</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            The newest page in our story 📓
          </p>

          <div className="mt-5">
            {latestEntry ? (
              <>
                <p className="font-semibold text-lg">{latestEntry.title}</p>
                <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-3">
                  {latestEntry.body}
                </p>
                <div className="mt-4">
                  <Link href="/diary" className="text-sm font-medium text-pink-500 hover:text-pink-600">
                    View all entries →
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No entries yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Milestones */}
      <Timeline />

      {/* Goals */}
      <GoalsTracker />
    </div>
  );
}

function MoodCard({ name, mood }: { name: string; mood: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-2xl border border-pink-100 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 backdrop-blur px-5 py-4"
    >
      <p className="text-sm text-gray-500 dark:text-gray-400">{name}</p>
      <p className="mt-2 text-2xl font-bold text-pink-500">{mood}</p>
    </motion.div>
  );
}
