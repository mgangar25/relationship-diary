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
    <nav className="w-full border-b border-gray-200 dark:border-gray-700">
      <ul className="flex gap-6 px-6 py-4 overflow-x-auto">
        {navItems.map(item => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`font-medium transition-colors ${
                  active
                    ? "text-pink-500"
                    : "text-gray-600 dark:text-gray-300 hover:text-pink-400"
                }`}
              >
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
