"use client";

import { useEffect, useMemo, useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import FloatingHearts from "@/components/FloatingHearts";

function getSystemPrefersDark() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const [systemDark, setSystemDark] = useState(false);

  // Track system preference
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(mq.matches);

    update();

    try {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    } catch {
      mq.addListener(update);
      return () => mq.removeListener(update);
    }
  }, []);

  const effectiveDark = useMemo(() => {
    const pref = settings.personalization.theme;

    if (pref === "dark") return true;
    if (pref === "light") return false;

    return systemDark || getSystemPrefersDark();
  }, [settings.personalization.theme, systemDark]);

  // Apply theme + accent safely
  useEffect(() => {
    const root = document.documentElement;

    // Reset first (prevents stuck dark mode)
    root.classList.remove("dark");

    // Accent
    root.setAttribute("data-accent", settings.personalization.accent);

    if (effectiveDark) {
      root.classList.add("dark");
    }
  }, [settings.personalization.accent, effectiveDark]);

  return (
    <div className="relative min-h-screen transition-colors duration-300">
      {/* Background glow */}
      {settings.personalization.backgroundGlow && (
        <>
          <div
            className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl -z-10 opacity-40 animate-pulse"
            style={{ backgroundColor: "var(--accent-200)" }}
          />
          <div
            className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl -z-10 opacity-30 animate-pulse"
            style={{ backgroundColor: "var(--accent-100)" }}
          />
        </>
      )}

      {/* Floating hearts */}
      {settings.personalization.floatingHearts && <FloatingHearts />}

      {children}
    </div>
  );
}
