"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Bell, User, Menu, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { NotificationBell } from "@/components/notifications";
import { useCart } from "@/contexts/CartContext";

export function Header() {
  const pathName = usePathname();
  const [profileLink, setProfileLink] = useState("/login");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getTotalItems } = useCart();

  const linkClasses = useCallback(
    (path: string) =>
      pathName === path
        ? "text-[#84B067] font-semibold relative group"
        : "text-gray-800 hover:text-[#84B067] relative group",
    [pathName]
  );

  useEffect(() => {
    const token = localStorage.getItem("authentication");
    setProfileLink(token ? "/profile" : "/login");
  }, []);

  const links = [
    // { href: "/", label: "home" },
    { href: "/marketplace", label: "marketplace" },
    { href: "/chats", label: "chats" },
    { href: "/aboutus", label: "about us" },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 left-0 w-full z-50 shadow-md border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand - Fixed width for balance */}
          <div className="flex-shrink-0 w-32">
            <Link
              href="/"
              className="font-header text-xl font-bold bg-gradient-to-r from-[#69773D] to-[#84B067] bg-clip-text text-transparent hover:from-[#84B067] hover:to-[#69773D] transition-all duration-300"
            >
              KU Market
            </Link>
          </div>

          {/* Desktop Navigation - Centered with even spacing */}
          <nav className="hidden lg:flex flex-1 justify-center items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${linkClasses(
                  link.href
                )} capitalize transition-all duration-300`}
              >
                {link.label}
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-[#69773D] to-[#84B067] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Right side - Fixed width matching logo for symmetry */}
          <div className="hidden lg:flex items-center justify-end gap-2 w-32">
            <Link
              href="/cart"
              className="relative p-2.5 rounded-full hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 transition-all duration-300 transform hover:scale-110 hover:shadow-md group"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700 group-hover:text-[#69773D] transition-colors" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {getTotalItems() > 9 ? "9+" : getTotalItems()}
                </span>
              )}
            </Link>

            <div className="transform hover:scale-110 transition-all duration-300">
              <NotificationBell />
            </div>

            <Link
              href={profileLink}
              className="p-2.5 rounded-full hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 transition-all duration-300 transform hover:scale-110 hover:shadow-md group"
              title="Profile"
            >
              <User className="w-5 h-5 text-gray-700 group-hover:text-[#69773D] transition-colors" />
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 transition-all duration-300 hover:shadow-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700 transition-transform duration-300 rotate-90" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700 transition-transform duration-300" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4 animate-in slide-in-from-top duration-300">
            {/* Navigation Links */}
            <div className="space-y-1 mb-4">
              {links.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-3 rounded-xl font-medium transition-all duration-300 capitalize ${
                    pathName === link.href
                      ? "text-white bg-gradient-to-r from-[#69773D] to-[#84B067] shadow-md transform scale-[1.02]"
                      : "text-gray-700 hover:text-[#69773D] hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 hover:shadow-sm hover:translate-x-1"
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Action Links */}
            <div className="border-t border-gray-100 pt-4 space-y-1">
              <Link
                href="/cart"
                className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-700 hover:text-[#69773D] hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 transition-all duration-300 hover:shadow-sm hover:translate-x-1 group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Cart</span>
                </div>
                {getTotalItems() > 0 && (
                  <span className="min-w-[24px] h-6 px-2 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-md">
                    {getTotalItems() > 9 ? "9+" : getTotalItems()}
                  </span>
                )}
              </Link>

              <Link
                href="/notifications"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:text-[#69773D] hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 transition-all duration-300 hover:shadow-sm hover:translate-x-1 group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Notifications</span>
              </Link>

              <Link
                href={profileLink}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:text-[#69773D] hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 transition-all duration-300 hover:shadow-sm hover:translate-x-1 group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Profile</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
