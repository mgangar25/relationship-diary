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

  useEffect(() => {
    async function fetchLetters() {
      if (!user?.email) return;

      const q = query(
        collection(db, "letters"),
        where("recipientEmail", "==", user.email),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const data: Letter[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Letter, "id">),
      }));

      setLetters(data);
      setLoading(false);
    }

    fetchLetters();
  }, [user]);

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Inbox 💌</h1>

        <Link href="/letters/new" className="btn btn-primary">
          New Letter
        </Link>
      </div>

      {loading ? (
        <p className="page-subtext">Loading letters…</p>
      ) : letters.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-lg font-medium">No letters yet 💭</p>
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
                      !letter.read ? "font-bold" : "font-semibold"
                    }`}
                  >
                    {letter.subject}
                  </h2>

                  {!letter.read && (
                    <span className="text-xs text-red-500">
                      New
                    </span>
                  )}
                </div>

                <p className="mt-2 text-gray-700 dark:text-gray-300 line-clamp-2">
                  {letter.body}
                </p>

                <div className="mt-4 text-sm text-gray-500 flex justify-between">
                  <span>From: {letter.senderEmail}</span>

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
