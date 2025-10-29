"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Navbar";

export function ConditionalHeader() {
  const pathname = usePathname();

  // Don't show header on admin or seller routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/seller")) {
    return null;
  }

  return <Header />;
}
