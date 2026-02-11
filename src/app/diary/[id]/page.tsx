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

type DiaryEntry = {
  title: string;
  body: string;
  authorEmail: string;
  createdAt?: Timestamp;
};

export default function DiaryEntryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEntry() {
      const ref = doc(db, "diaryEntries", id);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        router.replace("/diary");
        return;
      }

      const data = snap.data() as DiaryEntry;

      setEntry(data);
      setTitle(data.title);
      setBody(data.body);
      setLoading(false);
    }

    fetchEntry();
  }, [id, router]);

  async function handleSave() {
    const ref = doc(db, "diaryEntries", id);
    await updateDoc(ref, { title, body });
    setEditing(false);
  }

  async function handleDelete() {
    const confirmed = confirm(
      "Delete this entry? This action cannot be undone."
    );
    if (!confirmed) return;

    await deleteDoc(doc(db, "diaryEntries", id));
    router.replace("/diary");
  }

  if (loading) {
    return (
      <main className="p-6">
        <p className="page-subtext">Loading entry…</p>
      </main>
    );
  }

  if (!entry) return null;

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="card space-y-4">
        {editing ? (
          <>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full rounded-lg border p-2 dark:bg-gray-800"
            />

            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={10}
              className="w-full rounded-lg border p-2 dark:bg-gray-800"
            />

            <div className="flex gap-3">
              <button onClick={handleSave} className="btn btn-primary">
                Save
              </button>

              <button
                onClick={() => {
                  setEditing(false);
                  setTitle(entry.title);
                  setBody(entry.body);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="page-title">
              {entry.title || "Untitled"}
            </h1>

            <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
              {entry.body}
            </p>

            <div className="pt-4 flex justify-between text-sm text-gray-500">
              <span>{entry.authorEmail}</span>

              {entry.createdAt?.toDate && (
                <span>
                  {entry.createdAt.toDate().toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setEditing(true)}
                className="btn btn-secondary"
              >
                Edit
              </button>

              <button
                onClick={handleDelete}
                className="btn btn-secondary text-red-600"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
