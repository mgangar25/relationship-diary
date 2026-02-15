"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

type Goal = {
  id: string;
  text: string;
  done: boolean;
  createdBy?: string;
};

export default function GoalsTracker() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const q = query(collection(db, "goals"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setGoals(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Goal, "id">),
        }))
      );
    });
    return () => unsub();
  }, []);

  async function addGoal() {
    if (!user?.email) return;
    const t = text.trim();
    if (!t) return;

    await addDoc(collection(db, "goals"), {
      text: t,
      done: false,
      createdBy: user.email,
      createdAt: serverTimestamp(),
    });

    setText("");
  }

  async function toggleGoal(g: Goal) {
    await updateDoc(doc(db, "goals", g.id), { done: !g.done });
  }

  async function removeGoal(id: string) {
    await deleteDoc(doc(db, "goals", id));
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-semibold">Shared Goals</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Little promises we keep together ✨
          </p>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g., Plan Berlin itinerary"
          className="input"
        />
        <button onClick={addGoal} className="btn btn-primary whitespace-nowrap">
          Add
        </button>
      </div>

      <div className="mt-5 space-y-2">
        {goals.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No goals yet. Add one 💗</p>
        ) : (
          goals.map((g) => (
            <div
              key={g.id}
              className="flex items-center gap-3 rounded-2xl border border-pink-100 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 backdrop-blur px-4 py-3"
            >
              <button
                onClick={() => toggleGoal(g)}
                className={`h-5 w-5 rounded-md border transition ${
                  g.done ? "bg-pink-500 border-pink-500" : "border-gray-300 dark:border-gray-600"
                }`}
                aria-label="Toggle goal"
              />

              <div className="flex-1">
                <p className={`font-medium ${g.done ? "line-through text-gray-400" : ""}`}>
                  {g.text}
                </p>
              </div>

              <button
                onClick={() => removeGoal(g.id)}
                className="text-sm text-red-500 hover:text-red-600"
                aria-label="Delete goal"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
