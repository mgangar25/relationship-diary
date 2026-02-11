"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Allow login page without auth
    if (!user && pathname !== "/login") {
      router.replace("/login");
    }
  }, [user, pathname, router]);

  // Prevent flash of protected content
  if (!user && pathname !== "/login") {
    return null;
  }

  return <>{children}</>;
}
