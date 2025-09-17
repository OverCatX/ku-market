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
        ? "text-[#84B067] font-semibold relative group"
        : "text-gray-800 hover:text-[#84B067] relative group",
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
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-[#84B067] transition-all group-hover:w-full"></span>
            </Link>
            <Link href="/marketplace" className={linkClasses("/marketplace")}>
              marketplace
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-[#84B067] transition-all group-hover:w-full"></span>
            </Link>
            <Link href="/chats" className={linkClasses("/chats")}>
              chats
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-[#84B067] transition-all group-hover:w-full"></span>
            </Link>
            <Link href="/about" className={linkClasses("/about")}>
              about us
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-[#84B067] transition-all group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <input
                type="search"
                placeholder="Search"
                className="w-56 pl-4 pr-10 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#84B067] transition"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-full hover:bg-gray-100 transition transform hover:scale-105"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                2
              </span>
            </Link>

            {/* Notification */}
            <Link
              href="/notifications"
              className="relative p-2 rounded-full hover:bg-gray-100 transition transform hover:scale-105"
            >
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-black text-xs rounded-full flex items-center justify-center">
                1
              </span>
            </Link>

            {/* Profile */}
            <Link
              href="/profile"
              className="p-2 rounded-full hover:bg-gray-100 transition transform hover:scale-105"
            >
              <User className="w-5 h-5 text-gray-700" />
            </Link>

            {/* Language */}
            <Link
              href="/language"
              className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-100 transition transform hover:scale-105"
            >
              🌐 <span className="font-medium text-yellow-600">ES</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
