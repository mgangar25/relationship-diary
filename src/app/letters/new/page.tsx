"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function NewLetterPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [recipientEmail, setRecipientEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!recipientEmail || !subject || !body) return;

    setLoading(true);

    await addDoc(collection(db, "letters"), {
      subject,
      body,
      senderEmail: user?.email,
      recipientEmail,
      createdAt: serverTimestamp(),
      read: false,
    });

    router.push("/letters");
  }

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="page-title">Send Letter 💌</h1>

      <div className="card space-y-4">
        <input
          placeholder="Recipient Email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          className="w-full rounded-lg border p-2 dark:bg-gray-800"
        />

        <input
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-lg border p-2 dark:bg-gray-800"
        />

        <textarea
          placeholder="Write your letter..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={12}
          className="w-full rounded-lg border p-2 dark:bg-gray-800"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? "Sending..." : "Send Letter"}
        </button>
      </div>
    </main>
  );
}
