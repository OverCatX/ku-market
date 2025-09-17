"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart, Bell, User, Menu, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function Header() {
  const pathName = usePathname();
  const [profileLink, setProfileLink] = useState("/login");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const linkClasses = useCallback(
    (path: string) =>
      pathName === path
        ? "text-[#84B067] font-semibold relative group"
        : "text-gray-800 hover:text-[#84B067] relative group",
    [pathName]
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    setProfileLink(token ? "/profile" : "/login");
  }, []);

  const links = [
    { href: "/", label: "home" },
    { href: "/marketplace", label: "marketplace" },
    { href: "/chats", label: "chats" },
    { href: "/about", label: "about us" },
  ];

  return (
    <header className="bg-white sticky top-0 left-0 w-full z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link href="/" className="text-xl font-bold text-[#69773D]">
            KU Market
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex flex-1 justify-center space-x-16">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={linkClasses(link.href)}
              >
                {link.label}
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-[#84B067] transition-all group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="relative">
              <input
                type="search"
                placeholder="Search"
                className="w-56 pl-4 pr-10 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#84B067] transition"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>

            <Link
              href="/cart"
              className="relative p-2 rounded-full hover:bg-gray-100 transition transform hover:scale-105"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                2
              </span>
            </Link>

            <Link
              href="/notifications"
              className="relative p-2 rounded-full hover:bg-gray-100 transition transform hover:scale-105"
            >
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-black text-xs rounded-full flex items-center justify-center">
                1
              </span>
            </Link>

            <Link
              href={profileLink}
              className="p-2 rounded-full hover:bg-gray-100 transition transform hover:scale-105"
            >
              <User className="w-5 h-5 text-gray-700" />
            </Link>

            <Link
              href="/language"
              className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-100 transition transform hover:scale-105"
            >
              🌐 <span className="font-medium text-yellow-600">EN</span>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 space-y-3 pb-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-gray-800 hover:text-[#84B067] font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="flex flex-col space-y-2 mt-2">
              <Link
                href="/cart"
                className="flex items-center gap-2 text-gray-700 hover:text-[#84B067]"
              >
                <ShoppingCart className="w-5 h-5" /> Cart
              </Link>
              <Link
                href="/notifications"
                className="flex items-center gap-2 text-gray-700 hover:text-[#84B067]"
              >
                <Bell className="w-5 h-5" /> Notifications
              </Link>
              <Link
                href={profileLink}
                className="flex items-center gap-2 text-gray-700 hover:text-[#84B067]"
              >
                <User className="w-5 h-5" /> Profile
              </Link>
              <Link
                href="/language"
                className="flex items-center gap-2 text-gray-700 hover:text-[#84B067]"
              >
                🌐 Language
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
