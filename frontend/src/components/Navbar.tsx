"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart, Bell, User } from "lucide-react";
import { useCallback } from "react";

export function Header() {
  const pathName = usePathname();

  const linkClasses = useCallback(
    (path: string) =>
      pathName === path
        ? "text-[#84B067] font-semibold"
        : "text-gray-800 hover:text-[#84B067]",
    [pathName]
  );

  return (
    <header className="bg-white fixed top-0 left-0 w-full z-50 shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Navigation */}
          <nav className="flex-1 flex justify-center space-x-16">
            <Link href="/" className={linkClasses("/")}>
              home
            </Link>
            <Link href="/marketplace" className={linkClasses("/marketplace")}>
              marketplace
            </Link>
            <Link href="/chats" className={linkClasses("/chats")}>
              chats
            </Link>
            <Link href="/about" className={linkClasses("/about")}>
              about us
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <input
                type="search"
                placeholder="Search"
                className="w-56 pl-4 pr-10 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>

            {/* Language Switch */}
            <button className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-full">
              🌐 <span className="font-medium text-yellow-600">ES</span>
            </button>

            {/* Cart */}
            <button className="relative p-2">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                2
              </span>
            </button>

            {/* Notification */}
            <button className="relative p-2">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-black text-xs rounded-full flex items-center justify-center">
                1
              </span>
            </button>

            {/* Profile */}
            <button className="p-2">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
