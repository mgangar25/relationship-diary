"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function NewDiaryEntryPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!user) return;

    setLoading(true);

    await addDoc(collection(db, "diaryEntries"), {
      title,
      body,
      authorId: user.uid,
      authorEmail: user.email,
      createdAt: serverTimestamp(),
    });

    router.push("/diary");
  }

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h1 className="page-title">New Diary Entry ✍️</h1>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full rounded-lg border p-2 dark:bg-gray-800"
        />

        <textarea
          placeholder="Write your thoughts..."
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={8}
          className="w-full rounded-lg border p-2 dark:bg-gray-800"
        />

        <button
          onClick={handleSave}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? "Saving..." : "Save Entry"}
        </button>
      </div>
    </main>
  );
}
