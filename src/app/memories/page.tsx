"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

type Memory = {
  id: string;
  imageUrl: string;
  caption: string;
  authorEmail: string;
  createdAt?: Timestamp;
};

export default function MemoriesPage() {
  const { user } = useAuth();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

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

  // EDIT CAPTION
  const handleEdit = async (memory: Memory) => {
    const newCaption = prompt("Edit caption:", memory.caption);
    if (!newCaption) return;

    try {
      await updateDoc(doc(db, "memories", memory.id), {
        caption: newCaption,
      });

      setMemories(prev =>
        prev.map(m =>
          m.id === memory.id ? { ...m, caption: newCaption } : m
        )
      );

      if (selectedMemory?.id === memory.id) {
        setSelectedMemory({
          ...memory,
          caption: newCaption,
        });
      }
    } catch (error) {
      console.error("Edit failed:", error);
      alert("Could not update caption.");
    }
  };

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="page-title">Memories 🖼️</h1>

        <Link href="/memories/new" className="btn btn-primary">
          New Memory
        </Link>
      </div>

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
            <div
              key={memory.id}
              className="card p-0 overflow-hidden cursor-pointer"
              onClick={() => setSelectedMemory(memory)}
            >
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

                {user?.email === memory.authorEmail && (
                  <div
                    className="pt-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleEdit(memory)}
                      className="text-blue-500 text-xs"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {selectedMemory && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setSelectedMemory(null)}
        >
          <div
            className="bg-white dark:bg-neutral-900 p-6 rounded-xl max-w-3xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedMemory.imageUrl}
              alt="Memory"
              className="w-full max-h-[70vh] object-contain rounded-lg"
            />

            {selectedMemory.caption && (
              <p className="mt-4 text-gray-700 dark:text-gray-300">
                {selectedMemory.caption}
              </p>
            )}

            {user?.email === selectedMemory.authorEmail && (
              <div className="mt-4">
                <button
                  onClick={() => handleEdit(selectedMemory)}
                  className="text-blue-500 text-sm"
                >
                  Edit Caption
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

