"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

type Letter = {
  subject: string;
  body: string;
  senderEmail: string;
  recipientEmail: string;
  createdAt?: Timestamp;
  read: boolean;
};

export default function LetterPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [letter, setLetter] = useState<Letter | null>(null);

  useEffect(() => {
    async function fetchLetter() {
      const ref = doc(db, "letters", id);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        router.replace("/letters");
        return;
      }

      const data = snap.data() as Letter;

      setLetter(data);

      if (!data.read && user?.email === data.recipientEmail) {
        await updateDoc(ref, { read: true });
      }
    }

    fetchLetter();
  }, [id, router, user]);

  async function handleDelete() {
    const confirmed = confirm("Delete this letter?");
    if (!confirmed) return;

    await deleteDoc(doc(db, "letters", id));
    router.push("/letters");
  }

  if (!letter) return null;

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <div className="card space-y-6">
        <h1 className="page-title">{letter.subject}</h1>

        <p className="whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200">
          {letter.body}
        </p>

        <div className="flex justify-between text-sm text-gray-500 pt-4">
          <span>From: {letter.senderEmail}</span>

          {letter.createdAt?.toDate && (
            <span>
              {letter.createdAt.toDate().toLocaleDateString()}
            </span>
          )}
        </div>

        {(user?.email === letter.senderEmail ||
          user?.email === letter.recipientEmail) && (
          <div className="pt-4">
            <button
              onClick={handleDelete}
              className="btn btn-secondary text-red-600"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
