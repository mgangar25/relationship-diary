"use client";

import { useEffect, useMemo, useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import FloatingHearts from "@/components/FloatingHearts";

function getSystemPrefersDark() {
  if (typeof window === "undefined") return false;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const [systemDark, setSystemDark] = useState(false);

  // Track system theme only (for theme === "system")
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(mq.matches);

    update();

    // modern + fallback
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
    // system
    return systemDark || getSystemPrefersDark();
  }, [settings.personalization.theme, systemDark]);

  // Apply theme + accent to <html>
  useEffect(() => {
    const root = document.documentElement;

    // accent
    root.setAttribute("data-accent", settings.personalization.accent);

    // theme
    if (effectiveDark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [settings.personalization.accent, effectiveDark]);

  return (
    <div className="relative min-h-screen">
      {settings.personalization.backgroundGlow && (
        <>
          {/* glow uses accent variables indirectly via CSS? Keep soft colors for now */}
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl -z-10 animate-pulse"
               style={{ backgroundColor: "var(--accent-200)", opacity: 0.35 }} />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl -z-10 animate-pulse"
               style={{ backgroundColor: "var(--accent-100)", opacity: 0.25 }} />
        </>
      )}

      {settings.personalization.floatingHearts && <FloatingHearts />}

      {children}
    </div>
  );
}
