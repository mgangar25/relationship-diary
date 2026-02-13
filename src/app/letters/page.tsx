"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

type Letter = {
  id: string;
  subject: string;
  body: string;
  senderEmail: string;
  recipientEmail: string;
  createdAt?: Timestamp;
  read: boolean;
};

export default function LettersPage() {
  const { user } = useAuth();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");

  useEffect(() => {
    async function fetchLetters() {
      if (!user?.email) return;

      setLoading(true);

      let q;

      if (activeTab === "inbox") {
        q = query(
          collection(db, "letters"),
          where("recipientEmail", "==", user.email),
          orderBy("createdAt", "desc")
        );
      } else {
        q = query(
          collection(db, "letters"),
          where("senderEmail", "==", user.email),
          orderBy("createdAt", "desc")
        );
      }

      const snapshot = await getDocs(q);

      const data: Letter[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Letter, "id">),
      }));

      setLetters(data);
      setLoading(false);
    }

    fetchLetters();
  }, [user, activeTab]);

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="page-title">Letters 💌</h1>

        <Link href="/letters/new" className="btn btn-primary">
          New Letter
        </Link>
      </div>

      {/* Toggle Tabs */}
      <div className="flex gap-6 border-b pb-2">
        <button
          onClick={() => setActiveTab("inbox")}
          className={`pb-1 transition ${
            activeTab === "inbox"
              ? "border-b-2 border-pink-500 font-semibold"
              : "text-gray-500"
          }`}
        >
          Inbox
        </button>

        <button
          onClick={() => setActiveTab("sent")}
          className={`pb-1 transition ${
            activeTab === "sent"
              ? "border-b-2 border-pink-500 font-semibold"
              : "text-gray-500"
          }`}
        >
          Sent
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <p className="page-subtext">Loading letters…</p>
      ) : letters.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-lg font-medium">
            No letters in {activeTab}.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {letters.map(letter => (
            <Link
              href={`/letters/${letter.id}`}
              key={letter.id}
              className="block"
            >
              <div className="card hover:cursor-pointer">
                <div className="flex justify-between items-center">
                  <h2
                    className={`text-lg ${
                      activeTab === "inbox" && !letter.read
                        ? "font-bold"
                        : "font-semibold"
                    }`}
                  >
                    {letter.subject}
                  </h2>

                  {activeTab === "inbox" && !letter.read && (
                    <span className="text-xs text-red-500">
                      New
                    </span>
                  )}
                </div>

                <p className="mt-2 text-gray-700 dark:text-gray-300 line-clamp-2">
                  {letter.body}
                </p>

                <div className="mt-4 text-sm text-gray-500 flex justify-between">
                  <span>
                    {activeTab === "inbox"
                      ? `From: ${letter.senderEmail}`
                      : `To: ${letter.recipientEmail}`}
                  </span>

                  {letter.createdAt?.toDate && (
                    <span>
                      {letter.createdAt.toDate().toLocaleDateString()}
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
