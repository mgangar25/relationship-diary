"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <main className="p-6 space-y-6">
      {/* Hero / Intro */}
      <div className="card">
        <h1 className="page-title">Relationship Diary 💕</h1>
        <p className="page-subtext">
          A private place for memories, letters, and little moments.
        </p>

        {user?.email && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Logged in as <span className="font-medium">{user.email}</span>
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={toggleTheme}
          className="btn btn-secondary"
        >
          Switch to {theme === "light" ? "Dark" : "Light"} Mode
        </button>

        <Link href="/diary/new" className="btn btn-primary">
          Write New Entry
        </Link>
      </div>
    </main>
  );
}
