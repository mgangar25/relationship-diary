"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type DiaryEntry = {
  id: string;
  title: string;
  body: string;
  authorEmail: string;
  createdAt?: Timestamp;
};

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEntries() {
      const q = query(
        collection(db, "diaryEntries"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const data: DiaryEntry[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<DiaryEntry, "id">),
      }));

      setEntries(data);
      setLoading(false);
    }

    fetchEntries();
  }, []);

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="page-title">Diary</h1>

        <Link href="/diary/new" className="btn btn-primary">
          New Entry
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <p className="page-subtext">Loading entries…</p>
      ) : entries.length === 0 ? (
        <div className="card text-center">
          <p className="page-subtext">No diary entries yet.</p>
          <p className="mt-2 text-sm text-gray-500">
            Click “New Entry” to write your first one 💗
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => (
            <Link
              href={`/diary/${entry.id}`}
              key={entry.id}
              className="block"
            >
              <div className="card hover:cursor-pointer">
                <h2 className="text-lg font-semibold">
                  {entry.title || "Untitled"}
                </h2>

                <p className="mt-2 text-gray-700 dark:text-gray-300 line-clamp-3">
                  {entry.body}
                </p>

                <div className="mt-4 text-sm text-gray-500 flex justify-between">
                  <span>{entry.authorEmail}</span>

                  {entry.createdAt?.toDate && (
                    <span>
                      {entry.createdAt.toDate().toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
