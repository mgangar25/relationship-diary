"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

/* ================= TYPES ================= */

export type Accent = "pink" | "purple" | "rose";
export type ThemePref = "light" | "dark" | "system";

export type CoupleSettings = {
  couple: {
    malayName: string;
    shrutiName: string;
    malayEmail: string;
    shrutiEmail: string;
    relationshipStartDate: string; // "YYYY-MM-DD"

    malayBirthday: string; // "YYYY-MM-DD"
    shrutiBirthday: string; // "YYYY-MM-DD"
    birthdayConfetti: boolean;
  };

  personalization: {
    theme: ThemePref;
    accent: Accent;
    floatingHearts: boolean;
    backgroundGlow: boolean;
  };

  notifications: {
    reminders: boolean;
    birthdays: boolean;
    unreadLetters: boolean;

    quietHoursEnabled: boolean;
    quietStart: string; // "HH:MM"
    quietEnd: string; // "HH:MM"
  };

  relationship: {
    showDaysTogether: boolean;
    showMoodsOnHome: boolean;
    showTimelineOnHome: boolean;
  };

  privacy: {
    requireReauthForDangerZone: boolean;
  };

  updatedAt?: unknown;
};

/* ================= DEFAULT SETTINGS ================= */

const DEFAULT_SETTINGS: CoupleSettings = {
  couple: {
    malayName: "Malay",
    shrutiName: "Shruti",
    malayEmail: "malaygangar06@gmail.com",
    shrutiEmail: "shrutikadam103@gmail.com",
    relationshipStartDate: "2025-12-27",

    // put any year you want, the month/day matters most for UI
    malayBirthday: "2000-08-25",
    shrutiBirthday: "2000-09-01",
    birthdayConfetti: true,
  },
  personalization: {
    theme: "system",
    accent: "pink",
    floatingHearts: true,
    backgroundGlow: true,
  },
  notifications: {
    reminders: true,
    birthdays: true,
    unreadLetters: true,
    quietHoursEnabled: false,
    quietStart: "22:00",
    quietEnd: "08:00",
  },
  relationship: {
    showDaysTogether: true,
    showMoodsOnHome: true,
    showTimelineOnHome: true,
  },
  privacy: {
    requireReauthForDangerZone: true,
  },
};

/* ================= CONTEXT ================= */

type SettingsContextType = {
  settings: CoupleSettings;
  loading: boolean;
  saveSettings: (next: CoupleSettings) => Promise<void>;
  patchSettings: (patch: Partial<CoupleSettings>) => Promise<void>;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

// one global settings doc
const SETTINGS_DOC = doc(db, "appMeta", "settings");

/* ================= HELPERS ================= */

function mergeSettings(base: CoupleSettings, patch: Partial<CoupleSettings>): CoupleSettings {
  // deep merge each section so partial patches don’t wipe fields
  return {
    ...base,
    ...patch,
    couple: { ...base.couple, ...(patch.couple ?? {}) },
    personalization: { ...base.personalization, ...(patch.personalization ?? {}) },
    notifications: { ...base.notifications, ...(patch.notifications ?? {}) },
    relationship: { ...base.relationship, ...(patch.relationship ?? {}) },
    privacy: { ...base.privacy, ...(patch.privacy ?? {}) },
  };
}

/* ================= PROVIDER ================= */

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<CoupleSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      SETTINGS_DOC,
      async (snap) => {
        try {
          if (!snap.exists()) {
            // create once
            await setDoc(
              SETTINGS_DOC,
              { ...DEFAULT_SETTINGS, updatedAt: serverTimestamp() },
              { merge: true }
            );
            setSettings(DEFAULT_SETTINGS);
            setLoading(false);
            return;
          }

          const data = snap.data() as Partial<CoupleSettings>;
          setSettings(mergeSettings(DEFAULT_SETTINGS, data));
          setLoading(false);
        } catch {
          setSettings(DEFAULT_SETTINGS);
          setLoading(false);
        }
      },
      () => {
        setSettings(DEFAULT_SETTINGS);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const saveSettings = async (next: CoupleSettings) => {
    setSettings(next);
    await setDoc(
      SETTINGS_DOC,
      { ...next, updatedAt: serverTimestamp() },
      { merge: true }
    );
  };

  const patchSettings = async (patch: Partial<CoupleSettings>) => {
    setSettings((prev) => {
      const merged = mergeSettings(prev, patch);
      // fire-and-forget writing using merged
      setDoc(
        SETTINGS_DOC,
        { ...merged, updatedAt: serverTimestamp() },
        { merge: true }
      );
      return merged;
    });
  };

  // IMPORTANT: no useMemo here (prevents the “Compilation Skipped memoization” warning)
  return (
    <SettingsContext.Provider value={{ settings, loading, saveSettings, patchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be inside SettingsProvider");
  return ctx;
}
