"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";

export default function StatsPage() {
  const [entries, setEntries] = useState(0);
  const [letters, setLetters] = useState(0);
  const [memories, setMemories] = useState(0);
  const [firstEntryDate, setFirstEntryDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  // 💕 Relationship Start Date
  const relationshipStartDate = new Date("2025-12-27");

  // Clean day calculation
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(relationshipStartDate);
  start.setHours(0, 0, 0, 0);

  const daysTogether = Math.max(
    Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    0
  );

  useEffect(() => {
    // Count diary entries
    const unsubDiaryCount = onSnapshot(
      collection(db, "diaryEntries"),
      (snapshot) => {
        setEntries(snapshot.size);
      }
    );

    // Get FIRST diary entry safely
    const firstEntryQuery = query(
      collection(db, "diaryEntries"),
      orderBy("createdAt", "asc"),
      limit(1)
    );

    const unsubFirstEntry = onSnapshot(firstEntryQuery, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const ts = doc.data().createdAt;
        if (ts?.seconds) {
          setFirstEntryDate(new Date(ts.seconds * 1000));
        }
      }
      setLoading(false);
    });

    const unsubLetters = onSnapshot(
      collection(db, "letters"),
      (snapshot) => {
        setLetters(snapshot.size);
      }
    );

    const unsubMemories = onSnapshot(
      collection(db, "memories"),
      (snapshot) => {
        setMemories(snapshot.size);
      }
    );

    return () => {
      unsubDiaryCount();
      unsubFirstEntry();
      unsubLetters();
      unsubMemories();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-2 text-gray-800 dark:text-white">
          Our Journey 💖
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-10">
          Together since December 27, 2025 ✨
        </p>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">
            Loading your memories...
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <StatCard title="Days Together" value={daysTogether} />
              <StatCard title="Diary Entries" value={entries} />
              <StatCard title="Letters Written" value={letters} />
              <StatCard title="Memories Saved" value={memories} />
            </div>

            {firstEntryDate && (
              <p className="mt-10 text-sm text-gray-500 dark:text-gray-400">
                First diary entry on{" "}
                {firstEntryDate.toDateString()} 🥹
              </p>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.06 }}
      className="p-8 rounded-3xl shadow-xl bg-white dark:bg-gray-800 border border-pink-100 dark:border-gray-700"
    >
      <h2 className="text-lg font-medium text-gray-500 dark:text-gray-400">
        {title}
      </h2>

      <p className="text-5xl font-extrabold mt-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
        {value}
      </p>
    </motion.div>
  );
}
