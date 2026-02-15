"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Diary", href: "/diary" },
  { name: "Memories", href: "/memories" },
  { name: "Letters", href: "/letters" },
  { name: "Calendar", href: "/calendar" },
  { name: "Mood", href: "/mood" },
  { name: "Stats", href: "/stats" },
  { name: "Settings", href: "/settings" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!user?.email) return;

    const q = query(
      collection(db, "letters"),
      where("recipientEmail", "==", user.email),
      where("read", "==", false)
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => setUnreadCount(snap.size),
      (err) => console.error("Unread listener error:", err)
    );

    return () => unsubscribe();
  }, [user?.email]);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  if (pathname === "/login") return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-pink-100 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-6 py-4 overflow-x-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <div key={item.href} className="relative">
                <Link
                  href={item.href}
                  className={`relative whitespace-nowrap font-medium transition-colors ${
                    active
                      ? "text-pink-600"
                      : "text-gray-600 dark:text-gray-300 hover:text-pink-500"
                  }`}
                >
                  {item.name}
                </Link>

                {active && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 h-[2px] w-full rounded-full bg-pink-500"
                  />
                )}

                {item.href === "/letters" && unreadCount > 0 && (
                  <span className="badge-pulse absolute -top-2 -right-3 bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
                    {unreadCount}
                  </span>
                )}
              </div>
            );
          })}

          <div className="flex-1" />

          <button
            onClick={handleLogout}
            className="text-sm font-medium text-gray-500 hover:text-pink-500 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
