"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  Timestamp,
  onSnapshot,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

/* ---------------- TYPES ---------------- */

type CalendarItem = {
  title?: string;
  caption?: string;
  subject?: string;
  authorEmail?: string;
  uploaderEmail?: string;
  senderEmail?: string;
  createdAt?: Timestamp;
};

type EventItem = {
  id: string;
  title: string;
  date: string;
};

type DayActivityMap = {
  [date: string]: boolean;
};

/* ---------------- HELPERS ---------------- */

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(year: number, month: number, day: number) {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function getNameFromEmail(email?: string) {
  if (!email) return "";
  if (email === "malaygangar06@gmail.com") return "Malay";
  if (email === "shrutikadam103@gmail.com") return "Shruti";
  return "";
}

/* ---------------- COMPONENT ---------------- */

export default function CalendarPage() {
  const { user } = useAuth();
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [diaryEntries, setDiaryEntries] = useState<CalendarItem[]>([]);
  const [memories, setMemories] = useState<CalendarItem[]>([]);
  const [letters, setLetters] = useState<CalendarItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [activityMap, setActivityMap] = useState<DayActivityMap>({});

  const [newReminder, setNewReminder] = useState("");

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) daysArray.push(null);
  for (let day = 1; day <= daysInMonth; day++) daysArray.push(day);

  function goToPrevMonth() {
    setCurrentMonth(new Date(year, month - 1, 1));
  }

  function goToNextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1));
  }

  const monthName = currentMonth.toLocaleString("default", {
    month: "long",
  });

  /* ---------------- SELECTED DATE FETCH ---------------- */

  useEffect(() => {
    if (!selectedDate) return;

    const [y, m, d] = selectedDate.split("-").map(Number);
    const start = new Date(y, m - 1, d, 0, 0, 0, 0);
    const end = new Date(y, m - 1, d, 23, 59, 59, 999);

    const startTs = Timestamp.fromDate(start);
    const endTs = Timestamp.fromDate(end);

    const diaryQuery = query(
      collection(db, "diaryEntries"),
      where("createdAt", ">=", startTs),
      where("createdAt", "<=", endTs)
    );

    const memoryQuery = query(
      collection(db, "memories"),
      where("createdAt", ">=", startTs),
      where("createdAt", "<=", endTs)
    );

    const letterQuery = query(
      collection(db, "letters"),
      where("createdAt", ">=", startTs),
      where("createdAt", "<=", endTs)
    );

    const eventsQuery = query(
      collection(db, "events"),
      where("date", "==", selectedDate)
    );

    const unsubDiary = onSnapshot(diaryQuery, snap =>
      setDiaryEntries(snap.docs.map(d => d.data() as CalendarItem))
    );

    const unsubMemory = onSnapshot(memoryQuery, snap =>
      setMemories(snap.docs.map(d => d.data() as CalendarItem))
    );

    const unsubLetter = onSnapshot(letterQuery, snap =>
      setLetters(snap.docs.map(d => d.data() as CalendarItem))
    );

    const unsubEvents = onSnapshot(eventsQuery, snap =>
      setEvents(
        snap.docs.map(d => ({
          id: d.id,
          ...(d.data() as Omit<EventItem, "id">),
        }))
      )
    );

    return () => {
      unsubDiary();
      unsubMemory();
      unsubLetter();
      unsubEvents();
    };
  }, [selectedDate]);

  /* ---------------- MONTH DOTS ---------------- */

  useEffect(() => {
    async function fetchMonthActivity() {
      const start = new Date(year, month, 1, 0, 0, 0, 0);
      const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

      const startTs = Timestamp.fromDate(start);
      const endTs = Timestamp.fromDate(end);

      const map: DayActivityMap = {};
      const collectionsToCheck = ["diaryEntries", "memories", "letters"];

      for (const col of collectionsToCheck) {
        const q = query(
          collection(db, col),
          where("createdAt", ">=", startTs),
          where("createdAt", "<=", endTs)
        );

        const snap = await getDocs(q);

        snap.docs.forEach(doc => {
          const ts = doc.data().createdAt;
          if (ts?.seconds) {
            const d = new Date(ts.seconds * 1000);
            const key = formatDate(
              d.getFullYear(),
              d.getMonth(),
              d.getDate()
            );
            map[key] = true;
          }
        });
      }

      const eventsSnap = await getDocs(collection(db, "events"));
      eventsSnap.docs.forEach(doc => {
        const data = doc.data() as EventItem;
        if (data.date) map[data.date] = true;
      });

      setActivityMap(map);
    }

    fetchMonthActivity();
  }, [year, month]);

  /* ---------------- ADD / DELETE REMINDER ---------------- */

  async function addReminder() {
    if (!selectedDate || !newReminder.trim() || !user) return;

    await addDoc(collection(db, "events"), {
      title: newReminder.trim(),
      date: selectedDate,
      createdBy: user.email,
      createdAt: serverTimestamp(),
    });

    setNewReminder("");
  }

  async function deleteReminder(id: string) {
    await deleteDoc(doc(db, "events", id));
  }

  /* ---------------- BIRTHDAY ---------------- */

  function isBirthday(day: number) {
    if (month === 7 && day === 25) return true;
    if (month === 8 && day === 1) return true;
    return false;
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <button onClick={goToPrevMonth} className="px-4 py-2 bg-white dark:bg-gray-700 rounded-lg shadow">←</button>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{monthName} {year}</h1>
          <button onClick={goToNextMonth} className="px-4 py-2 bg-white dark:bg-gray-700 rounded-lg shadow">→</button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-7 gap-4">
          {daysArray.map((day, index) => {
            const formatted = day ? formatDate(year, month, day) : null;
            const isSelected = formatted === selectedDate;

            const isToday =
              day &&
              year === new Date().getFullYear() &&
              month === new Date().getMonth() &&
              day === new Date().getDate();

            const hasActivity = formatted && activityMap[formatted];
            const birthday = day ? isBirthday(day) : false;

            return (
              <div
                key={index}
                onClick={() => day && setSelectedDate(formatted!)}
                className={`h-28 rounded-2xl p-3 cursor-pointer transition
                  ${
                    day
                      ? "bg-white dark:bg-gray-800 shadow hover:scale-105"
                      : "bg-transparent"
                  }
                  ${isSelected ? "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20" : ""}
                  ${isToday ? "border-2 border-pink-500" : ""}
                  ${birthday ? "bg-pink-100 dark:bg-pink-900/30 border-2 border-pink-500" : ""}
                `}
              >
                {day && (
                  <>
                    <div className="flex justify-end font-medium">{day}</div>

                    {hasActivity && (
                      <div className="w-2 h-2 bg-pink-500 rounded-full mt-3 mx-auto" />
                    )}

                    {birthday && (
                      <div className="text-center text-xs text-pink-500 mt-1">🎂</div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* PANEL */}
        {selectedDate && (
          <div className="mt-12 p-8 rounded-3xl bg-white dark:bg-gray-800 shadow-xl space-y-6">
            <h2 className="text-xl font-semibold">{selectedDate}</h2>

            <Section title="Diary Entries" items={diaryEntries} />
            <Section title="Memories" items={memories} />
            <Section title="Letters" items={letters} />

            <div>
              <h3 className="font-medium mb-3">Reminders</h3>

              {events.length === 0 ? (
                <p className="text-sm text-gray-500">None</p>
              ) : (
                <ul className="space-y-2">
                  {events.map(event => (
                    <li key={event.id} className="flex justify-between items-center bg-yellow-100 dark:bg-yellow-900/30 px-3 py-2 rounded-lg">
                      {event.title}
                      <button onClick={() => deleteReminder(event.id)} className="text-red-500 text-sm">✕</button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex gap-2 mt-4">
                <input
                  value={newReminder}
                  onChange={(e) => setNewReminder(e.target.value)}
                  placeholder="Add reminder..."
                  className="flex-1 px-3 py-2 rounded-lg border dark:bg-gray-700"
                />
                <button onClick={addReminder} className="px-4 py-2 bg-pink-500 text-white rounded-lg">
                  Add
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- SECTION ---------------- */

function Section({ title, items }: { title: string; items: CalendarItem[] }) {
  return (
    <div>
      <h3 className="font-medium mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">None</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {items.map((item, index) => {
            const author =
              getNameFromEmail(
                item.authorEmail ||
                item.uploaderEmail ||
                item.senderEmail
              );

            return (
              <li key={index}>
                {author && <span className="font-semibold">{author} - </span>}
                {item.title || item.caption || item.subject}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
