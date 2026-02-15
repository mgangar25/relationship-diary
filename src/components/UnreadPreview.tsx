"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

/* ================= TYPES ================= */

type Letter = {
  id: string;
  subject: string;
  senderEmail: string;
  createdAt?: Timestamp;
};

/* ================= HELPERS ================= */

function getNameFromEmail(email?: string): string {
  if (!email) return "";
  if (email === "malaygangar06@gmail.com") return "Malay";
  if (email === "shrutikadam103@gmail.com") return "Shruti";
  return email;
}

/* ================= COMPONENT ================= */

export default function UnreadPreview() {
  const { user } = useAuth();
  const [letters, setLetters] = useState<Letter[]>([]);

  useEffect(() => {
    if (!user?.email) return;

    const q = query(
      collection(db, "letters"),
      where("recipientEmail", "==", user.email),
      where("read", "==", false),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data: Letter[] = snap.docs.map((doc) => {
        const d = doc.data();

        return {
          id: doc.id,
          subject: typeof d.subject === "string" ? d.subject : "No subject",
          senderEmail:
            typeof d.senderEmail === "string" ? d.senderEmail : "",
          createdAt: d.createdAt as Timestamp | undefined,
        };
      });

      setLetters(data);
    });

    return () => unsub();
  }, [user?.email]);

  /* ================= UI ================= */

  if (letters.length === 0) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold">Unread Letters</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          No unread letters 💌
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold">Unread Letters</h2>

      <div className="mt-5 space-y-3">
        {letters.map((letter) => (
          <Link
            key={letter.id}
            href={`/letters/${letter.id}`}
            className="block rounded-2xl border border-pink-100 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 backdrop-blur px-4 py-3 hover:scale-[1.02] transition"
          >
            <p className="font-semibold">{letter.subject}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              From {getNameFromEmail(letter.senderEmail)}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-4">
        <Link
          href="/letters"
          className="text-sm font-medium rd-accent-text"
        >
          View all letters →
        </Link>
      </div>
    </div>
  );
}
