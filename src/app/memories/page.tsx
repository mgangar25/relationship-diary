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

type Memory = {
  id: string;
  imageUrl: string;
  caption: string;
  authorEmail: string;
  createdAt?: Timestamp;
};

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMemories() {
      const q = query(
        collection(db, "memories"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const data: Memory[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Memory, "id">),
      }));

      setMemories(data);
      setLoading(false);
    }

    fetchMemories();
  }, []);

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="page-title">Memories 🖼️</h1>

        <Link href="/memories/new" className="btn btn-primary">
          New Memory
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <p className="page-subtext">Loading memories…</p>
      ) : memories.length === 0 ? (
        <div className="card text-center">
          <p className="page-subtext">No memories yet.</p>
          <p className="mt-2 text-sm text-gray-500">
            Upload your first photo memory 💗
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {memories.map(memory => (
            <div key={memory.id} className="card p-0 overflow-hidden">
              <img
                src={memory.imageUrl}
                alt={memory.caption || "Memory"}
                className="w-full h-64 object-cover"
              />

              <div className="p-4 space-y-2">
                {memory.caption && (
                  <p className="text-gray-700 dark:text-gray-300">
                    {memory.caption}
                  </p>
                )}

                <div className="flex justify-between text-xs text-gray-500">
                  <span>{memory.authorEmail}</span>

                  {memory.createdAt?.toDate && (
                    <span>
                      {memory.createdAt
                        .toDate()
                        .toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
