"use client";

import { useMemo, useState } from "react";
import { useSettings, Accent, ThemePref } from "@/context/SettingsContext";
import { collection, getDocs, writeBatch, doc as fsDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

type Tab = "profile" | "personalize" | "notifications" | "relationship" | "privacy";

export default function SettingsPage() {
  const { settings, patchSettings, loading } = useSettings();
  const { user } = useAuth();

  const [tab, setTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);

  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const title = useMemo(() => {
    const map: Record<Tab, string> = {
      profile: "Couple Profile",
      personalize: "Personalization",
      notifications: "Notifications",
      relationship: "Relationship Options",
      privacy: "Privacy & Data",
    };
    return map[tab];
  }, [tab]);

  // ✅ FIXED: safePatch without spread-type errors
  async function safePatch<K extends keyof typeof settings>(
    section: K,
    patch: Partial<(typeof settings)[K]>
  ) {
    setSaving(true);

    await patchSettings({
      [section]: patch,
    } as Partial<typeof settings>);

    setSaving(false);
  }

  async function exportAllData() {
    setExporting(true);
    try {
      const cols = ["diaryEntries", "memories", "letters", "moods", "events"];
      const result: Record<string, unknown[]> = {};

      for (const c of cols) {
        const snap = await getDocs(collection(db, c));
        result[c] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }

      const blob = new Blob([JSON.stringify(result, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `relationship-diary-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();

      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  async function deleteCollectionInBatches(colName: string) {
    const snap = await getDocs(collection(db, colName));
    if (snap.empty) return;

    // Firestore batch limit ~500 ops; keep safe
    const CHUNK = 450;
    const docs = snap.docs;

    for (let i = 0; i < docs.length; i += CHUNK) {
      const batch = writeBatch(db);
      const slice = docs.slice(i, i + CHUNK);
      slice.forEach((d) => batch.delete(fsDoc(db, colName, d.id)));
      await batch.commit();
    }
  }

  async function deleteAllAppData() {
    if (!user?.email) return;

    const ok = confirm(
      "This will permanently delete ALL diary entries, memories, letters, moods, and events. Continue?"
    );
    if (!ok) return;

    setDeleting(true);
    try {
      const cols = ["diaryEntries", "memories", "letters", "moods", "events"];
      for (const c of cols) {
        await deleteCollectionInBatches(c);
      }
      alert("All app data deleted.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="card">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtext">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtext">Everything that makes this feel like “our” app ✨</p>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {saving ? "Saving…" : "All changes auto-save"}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <TabButton active={tab === "profile"} onClick={() => setTab("profile")}>
            👤 Profile
          </TabButton>
          <TabButton active={tab === "personalize"} onClick={() => setTab("personalize")}>
            🎨 Personalize
          </TabButton>
          <TabButton active={tab === "notifications"} onClick={() => setTab("notifications")}>
            🔔 Notifications
          </TabButton>
          <TabButton active={tab === "relationship"} onClick={() => setTab("relationship")}>
            💖 Relationship
          </TabButton>
          <TabButton active={tab === "privacy"} onClick={() => setTab("privacy")}>
            🔐 Privacy
          </TabButton>
        </div>
      </div>

      {/* Content */}
      <div className="card space-y-6">
        <h2 className="text-2xl font-bold">{title}</h2>

        {/* PROFILE */}
        {tab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Malay name">
              <input
                className="input"
                value={settings.couple.malayName}
                onChange={(e) => safePatch("couple", { malayName: e.target.value })}
              />
            </Field>

            <Field label="Shruti name">
              <input
                className="input"
                value={settings.couple.shrutiName}
                onChange={(e) => safePatch("couple", { shrutiName: e.target.value })}
              />
            </Field>

            <Field label="Malay email">
              <input
                className="input"
                value={settings.couple.malayEmail}
                onChange={(e) => safePatch("couple", { malayEmail: e.target.value })}
              />
            </Field>

            <Field label="Shruti email">
              <input
                className="input"
                value={settings.couple.shrutiEmail}
                onChange={(e) => safePatch("couple", { shrutiEmail: e.target.value })}
              />
            </Field>

            <Field label="Relationship start date">
              <input
                type="date"
                className="input"
                value={settings.couple.relationshipStartDate}
                onChange={(e) => safePatch("couple", { relationshipStartDate: e.target.value })}
              />
            </Field>

            <Field label="Birthday confetti">
              <Toggle
                checked={settings.couple.birthdayConfetti}
                onChange={(v) => safePatch("couple", { birthdayConfetti: v })}
              />
            </Field>

            <Field label="Malay birthday">
              <input
                type="date"
                className="input"
                value={settings.couple.malayBirthday}
                onChange={(e) => safePatch("couple", { malayBirthday: e.target.value })}
              />
            </Field>

            <Field label="Shruti birthday">
              <input
                type="date"
                className="input"
                value={settings.couple.shrutiBirthday}
                onChange={(e) => safePatch("couple", { shrutiBirthday: e.target.value })}
              />
            </Field>
          </div>
        )}

        {/* PERSONALIZE */}
        {tab === "personalize" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Theme">
                <select
                  className="input"
                  value={settings.personalization.theme}
                  onChange={(e) =>
                    safePatch("personalization", { theme: e.target.value as ThemePref })
                  }
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </Field>

              <Field label="Accent color">
                <select
                  className="input"
                  value={settings.personalization.accent}
                  onChange={(e) =>
                    safePatch("personalization", { accent: e.target.value as Accent })
                  }
                >
                  <option value="pink">Pink</option>
                  <option value="rose">Rose</option>
                  <option value="purple">Purple</option>
                </select>
              </Field>

              <Field label="Floating hearts">
                <Toggle
                  checked={settings.personalization.floatingHearts}
                  onChange={(v) => safePatch("personalization", { floatingHearts: v })}
                />
              </Field>

              <Field label="Background glow">
                <Toggle
                  checked={settings.personalization.backgroundGlow}
                  onChange={(v) => safePatch("personalization", { backgroundGlow: v })}
                />
              </Field>
            </div>

            <div className="rounded-2xl border border-pink-100 dark:border-gray-700 p-6 bg-white/60 dark:bg-gray-800/60">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Next step after this page works: we’ll wire these settings into the app globally
                (theme override, accent classes, glow/hearts toggles).
              </p>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {tab === "notifications" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Reminder alerts">
                <Toggle
                  checked={settings.notifications.reminders}
                  onChange={(v) => safePatch("notifications", { reminders: v })}
                />
              </Field>

              <Field label="Birthday alerts">
                <Toggle
                  checked={settings.notifications.birthdays}
                  onChange={(v) => safePatch("notifications", { birthdays: v })}
                />
              </Field>

              <Field label="Unread letter alerts">
                <Toggle
                  checked={settings.notifications.unreadLetters}
                  onChange={(v) => safePatch("notifications", { unreadLetters: v })}
                />
              </Field>

              <Field label="Quiet hours enabled">
                <Toggle
                  checked={settings.notifications.quietHoursEnabled}
                  onChange={(v) => safePatch("notifications", { quietHoursEnabled: v })}
                />
              </Field>

              <Field label="Quiet start">
                <input
                  type="time"
                  className="input"
                  value={settings.notifications.quietStart}
                  onChange={(e) => safePatch("notifications", { quietStart: e.target.value })}
                />
              </Field>

              <Field label="Quiet end">
                <input
                  type="time"
                  className="input"
                  value={settings.notifications.quietEnd}
                  onChange={(e) => safePatch("notifications", { quietEnd: e.target.value })}
                />
              </Field>
            </div>

            <div className="rounded-2xl border border-pink-100 dark:border-gray-700 p-6 bg-white/60 dark:bg-gray-800/60">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Note: these are “in-app” notification preferences (badges, banners, highlights).
                We’re not doing phone push notifications right now.
              </p>
            </div>
          </div>
        )}

        {/* RELATIONSHIP */}
        {tab === "relationship" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Show days together on Home">
              <Toggle
                checked={settings.relationship.showDaysTogether}
                onChange={(v) => safePatch("relationship", { showDaysTogether: v })}
              />
            </Field>

            <Field label="Show moods on Home">
              <Toggle
                checked={settings.relationship.showMoodsOnHome}
                onChange={(v) => safePatch("relationship", { showMoodsOnHome: v })}
              />
            </Field>

            <Field label="Show timeline on Home">
              <Toggle
                checked={settings.relationship.showTimelineOnHome}
                onChange={(v) => safePatch("relationship", { showTimelineOnHome: v })}
              />
            </Field>
          </div>
        )}

        {/* PRIVACY */}
        {tab === "privacy" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Require re-auth for Danger Zone actions">
                <Toggle
                  checked={settings.privacy.requireReauthForDangerZone}
                  onChange={(v) => safePatch("privacy", { requireReauthForDangerZone: v })}
                />
              </Field>
            </div>

            <div className="rounded-2xl border border-pink-100 dark:border-gray-700 p-6 bg-white/60 dark:bg-gray-800/60">
              <h3 className="text-lg font-semibold mb-2">Export</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Download all data as JSON (diary, memories, letters, moods, reminders).
              </p>

              <button onClick={exportAllData} disabled={exporting} className="btn btn-primary">
                {exporting ? "Exporting…" : "Export All Data"}
              </button>
            </div>

            <div className="rounded-2xl border border-red-200 dark:border-red-900 p-6 bg-red-50/60 dark:bg-red-950/30">
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
                Danger Zone
              </h3>
              <p className="text-sm text-red-700/80 dark:text-red-300/80 mb-4">
                This deletes everything in Firestore collections (except your auth account).
              </p>

              <button
                onClick={deleteAllAppData}
                disabled={deleting}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                {deleting ? "Deleting…" : "Delete All App Data"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- UI helpers ---------------- */

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={
        active
          ? { backgroundColor: "var(--accent-500)" }
          : { borderColor: "var(--accent-200)" }
      }
      className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
        active
          ? "text-white shadow"
          : "bg-white/70 dark:bg-gray-800/70 border dark:border-gray-700 hover:scale-[1.03]"
      }`}
      type="button"
    >
      {children}
    </button>
  );
}


function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={checked ? { backgroundColor: "var(--accent-500)" } : undefined}
      className={`w-16 h-9 rounded-full p-1 transition flex items-center ${
        checked ? "" : "bg-gray-300 dark:bg-gray-700"
      }`}
      type="button"
    >
      <div
        className={`h-7 w-7 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-7" : "translate-x-0"
        }`}
      />
    </button>
  );
}
