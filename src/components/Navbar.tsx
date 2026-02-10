"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-6 px-6 py-4 overflow-x-auto">
        {navItems.map(item => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative whitespace-nowrap font-medium transition-all
                ${
                  active
                    ? "text-pink-500"
                    : "text-gray-600 dark:text-gray-300 hover:text-pink-400"
                }
              `}
            >
              {item.name}

              {active && (
                <span className="absolute -bottom-1 left-0 h-[2px] w-full rounded-full bg-pink-500" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
