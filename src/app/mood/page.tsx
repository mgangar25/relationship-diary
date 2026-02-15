"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

const moodOptions = [
  { label: "Happy", emoji: "😊" },
  { label: "Okay", emoji: "🙂" },
  { label: "Missing You", emoji: "🥺" },
  { label: "Excited", emoji: "✨" },
  { label: "Tired", emoji: "😴" },
  { label: "Stressed", emoji: "😵‍💫" },
];

export default function MoodPage() {
  const { user } = useAuth();
  const [todayMood, setTodayMood] = useState<string | null>(null);
  const [weeklyMoods, setWeeklyMoods] = useState<
    { date: string; mood: string }[]
  >([]);

  const today = new Date();
  const formattedToday = today.toISOString().split("T")[0]; // YYYY-MM-DD

  useEffect(() => {
    if (!user?.email) return;

    // 🔍 Listen to this user's moods
    const q = query(
      collection(db, "moods"),
      where("userEmail", "==", user.email)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const moods: { date: string; mood: string }[] = [];

      snapshot.forEach((doc) => {
        moods.push({
          date: doc.data().date,
          mood: doc.data().mood,
        });
      });

      setWeeklyMoods(moods);

      const todayEntry = moods.find(
        (m) => m.date === formattedToday
      );

      setTodayMood(todayEntry?.mood ?? null);
    });

    return () => unsubscribe();
  }, [user?.email, formattedToday]);

  async function handleSelectMood(mood: string) {
    if (!user?.email) return;

    const docId = `${user.email}_${formattedToday}`;

    await setDoc(doc(db, "moods", docId), {
      userEmail: user.email,
      date: formattedToday,
      mood,
      createdAt: serverTimestamp(),
    });

    setTodayMood(mood);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">
          Daily Mood 💛
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-8">
          How are you feeling today?
        </p>

        {/* Mood Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {moodOptions.map((option) => {
            const selected = todayMood === option.label;

            return (
              <motion.button
                key={option.label}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelectMood(option.label)}
                className={`p-6 rounded-2xl text-lg font-medium shadow-md transition
                  ${
                    selected
                      ? "bg-pink-500 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                  }
                `}
              >
                <div className="text-3xl mb-2">{option.emoji}</div>
                {option.label}
              </motion.button>
            );
          })}
        </div>

        {/* Weekly History */}
        {weeklyMoods.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
              Recent Moods
            </h2>

            <div className="flex flex-wrap gap-3">
              {weeklyMoods
                .sort((a, b) =>
                  b.date.localeCompare(a.date)
                )
                .slice(0, 7)
                .map((m) => {
                  const emoji =
                    moodOptions.find(
                      (opt) => opt.label === m.mood
                    )?.emoji ?? "🙂";

                  return (
                    <div
                      key={m.date}
                      className="px-4 py-2 rounded-full bg-white dark:bg-gray-800 shadow text-sm"
                    >
                      {emoji} {m.date}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
