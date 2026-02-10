"use client";

import { useTheme } from "@/context/ThemeContext";

export default function HomePage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="p-6 space-y-6">
      <div className="card">
        <h1 className="page-title">Relationship Diary 💕</h1>
        <p className="page-subtext">
          A private place for memories, letters, and little moments.
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={toggleTheme}
          className="btn btn-secondary"
        >
          Switch to {theme === "light" ? "Dark" : "Light"} Mode
        </button>

        <button className="btn btn-primary">
          Write New Entry
        </button>
      </div>
    </main>
  );
}
