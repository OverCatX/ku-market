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
        ? "text-[#69773D] font-bold relative"
        : "text-[#4A5130] hover:text-[#69773D] relative",
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
    { href: "/report", label: "report" },
  ];

  return (
    <header className="bg-gradient-to-b from-white to-green-50/30 backdrop-blur-xl sticky top-0 left-0 w-full z-50 border-b border-[#69773D]/10 shadow-lg shadow-green-900/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex items-center justify-between h-[68px]">
          {/* Logo / Brand */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="font-header text-2xl font-bold bg-gradient-to-r from-[#69773D] via-[#7BAA5F] to-[#84B067] bg-clip-text text-transparent hover:from-[#7BAA5F] hover:via-[#84B067] hover:to-[#69773D] transition-all duration-500 drop-shadow-sm"
            >
              KU Market
            </Link>
          </div>

          {/* Desktop Navigation - Centered with even spacing */}
          <nav className="hidden lg:flex flex-1 justify-center items-center gap-9">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${linkClasses(
                  link.href
                )} capitalize transition-all duration-300 px-5 py-2.5 text-sm font-semibold rounded-xl group`}
              >
                <span className="relative z-10">{link.label}</span>
                {pathName === link.href ? (
                  <span className="absolute inset-0 bg-gradient-to-r from-[#69773D]/15 via-[#7BAA5F]/20 to-[#84B067]/15 rounded-xl border border-[#69773D]/20 shadow-inner"></span>
                ) : (
                  <span className="absolute inset-0 bg-gradient-to-r from-green-50/0 to-emerald-50/0 rounded-xl group-hover:bg-[#69773D]/20 transition-all duration-300 border border-transparent group-hover:border-[#69773D]/10"></span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right side - Icons */}
          <div className="hidden lg:flex items-center justify-end gap-1">
            <Link
              href="/cart"
              className="relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[#69773D]/20 transition-all duration-300 group border border-transparent hover:border-[#69773D]/10 hover:shadow-md hover:shadow-green-900/5"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5 text-[#4A5130] group-hover:text-[#69773D] group-hover:scale-110 transition-all duration-300" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1.5 bg-[#780606] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                  {getTotalItems() > 9 ? "9+" : getTotalItems()}
                </span>
              )}
            </Link>

            <div className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[#69773D]/20 transition-all duration-300 border border-transparent hover:border-[#69773D]/10 hover:shadow-md hover:shadow-green-900/5">
              <NotificationBell />
            </div>

            <Link
              href={profileLink}
              className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[#69773D]/20 transition-all duration-300 group border border-transparent hover:border-[#69773D]/10 hover:shadow-md hover:shadow-green-900/5"
              title="Profile"
            >
              <User className="w-5 h-5 text-[#4A5130] group-hover:text-[#69773D] group-hover:scale-110 transition-all duration-300" />
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden p-2.5 rounded-xl hover:bg-[#69773D]/20 transition-all duration-300 border border-transparent hover:border-[#69773D]/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-[#4A5130] hover:text-[#69773D] transition-all duration-300 rotate-90" />
            ) : (
              <Menu className="w-6 h-6 text-[#4A5130] hover:text-[#69773D] transition-all duration-300" />
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
                      : "text-[#4A5130] hover:text-[#69773D] hover:bg-[#69773D]/20 hover:shadow-sm hover:translate-x-1"
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
                className="flex items-center justify-between px-4 py-3 rounded-xl text-[#4A5130] hover:text-[#69773D] hover:bg-[#69773D]/20 transition-all duration-300 hover:shadow-sm hover:translate-x-1 group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Cart</span>
                </div>
                {getTotalItems() > 0 && (
                  <span className="min-w-[24px] h-6 px-2 bg-[#780606] text-white text-xs rounded-full flex items-center justify-center font-bold shadow-md">
                    {getTotalItems() > 9 ? "9+" : getTotalItems()}
                  </span>
                )}
              </Link>

              <Link
                href="/notifications"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#4A5130] hover:text-[#69773D] hover:bg-[#69773D]/20 transition-all duration-300 hover:shadow-sm hover:translate-x-1 group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Notifications</span>
              </Link>

              <Link
                href={profileLink}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#4A5130] hover:text-[#69773D] hover:bg-[#69773D]/20 transition-all duration-300 hover:shadow-sm hover:translate-x-1 group"
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
