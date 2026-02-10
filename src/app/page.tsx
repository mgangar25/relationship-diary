"use client";

import { useTheme } from "@/context/ThemeContext";

export default function HomePage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">
        Relationship Diary 💕
      </h1>

      <button
        onClick={toggleTheme}
        className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700"
      >
        Switch to {theme === "light" ? "Dark" : "Light"} Mode
      </button>
    </main>
  );
}
