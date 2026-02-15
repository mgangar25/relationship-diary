"use client";

import { useSettings } from "@/context/SettingsContext";
import FloatingHearts from "@/components/FloatingHearts";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings } = useSettings();

  return (
    <div className="relative min-h-screen">
      {settings.personalization.backgroundGlow && (
        <>
          <div className="absolute top-0 left-0 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl -z-10 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl -z-10 animate-pulse" />
        </>
      )}

      {settings.personalization.floatingHearts && (
        <FloatingHearts />
      )}

      {children}
    </div>
  );
}
