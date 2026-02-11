"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function NewMemoryPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload() {
    if (!file || !user || !user.email) {
      setError("Please select an image.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("UPLOAD START");

      const safeEmail = user.email.replace(/[^a-zA-Z0-9]/g, "_");

      // 1️⃣ Create storage reference
      const storageRef = ref(
        storage,
        `memories/${safeEmail}/${Date.now()}-${file.name}`
      );

      // 2️⃣ Upload image
      await uploadBytes(storageRef, file);
      console.log("UPLOAD DONE");

      // 3️⃣ Get image URL
      const imageUrl = await getDownloadURL(storageRef);
      console.log("IMAGE URL:", imageUrl);

      // 4️⃣ Save metadata to Firestore
      await addDoc(collection(db, "memories"), {
        imageUrl,
        caption,
        authorEmail: user.email,
        createdAt: serverTimestamp(),
      });

      // 5️⃣ Navigate back to memories
      router.push("/memories");
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="page-title">New Memory 📸</h1>

      <div className="card space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={e => setFile(e.target.files?.[0] || null)}
        />

        <textarea
          placeholder="Write a caption…"
          value={caption}
          onChange={e => setCaption(e.target.value)}
          rows={4}
          className="w-full rounded-lg border p-2 dark:bg-gray-800"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          onClick={handleUpload}
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? "Uploading…" : "Save Memory"}
        </button>
      </div>
    </main>
  );
}
