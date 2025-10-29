"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  PlusCircle,
  LogOut,
  Menu,
  X,
  Store,
} from "lucide-react";
import Link from "next/link";
import type { UserData } from "@/config/auth";

interface SellerLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/seller/dashboard", icon: LayoutDashboard },
  { label: "Orders", path: "/seller/orders", icon: ShoppingBag },
  { label: "My Items", path: "/seller/items", icon: Package },
  { label: "Add Item", path: "/seller/add-item", icon: PlusCircle },
];

export default function SellerLayout({ children }: SellerLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sellerName, setSellerName] = useState<string>("");
  const [shopName, setShopName] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setSidebarOpen(window.innerWidth >= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (pathname === "/seller/login") return;

    const token = localStorage.getItem("authentication");
    const userStr = localStorage.getItem("user");
    const shopStr = localStorage.getItem("shop");

    if (!token || !userStr) {
      router.replace("/login?redirect=/seller/dashboard");
      return;
    }

    try {
      const user = JSON.parse(userStr) as UserData;

      // Check if user is verified
      if (!user.isVerified) {
        router.replace("/verify-identity");
        return;
      }

      setSellerName(user.name || "Seller");

      // Check if user has a shop
      if (shopStr) {
        const shop = JSON.parse(shopStr) as {
          shopName: string;
          shopStatus: string;
        };
        if (shop.shopStatus === "approved") {
          setShopName(shop.shopName);
        } else {
          router.replace("/request-store");
          return;
        }
      } else {
        router.replace("/request-store");
        return;
      }
    } catch {
      router.replace("/login?redirect=/seller/dashboard");
    }
  }, [pathname, router]);

  const handleLogout = (): void => {
    localStorage.clear();
    router.replace("/login");
  };

  const handleNavClick = (): void => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  if (pathname === "/seller/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isMobile
            ? sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : sidebarOpen
            ? "w-64"
            : "w-20"
        } ${
          isMobile ? "w-64" : ""
        } bg-gradient-to-b from-green-700 to-green-900 text-white transition-transform duration-300 ease-in-out md:transition-all flex flex-col fixed md:relative z-50 h-full shadow-xl md:shadow-none`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-green-600 min-h-[65px]">
          {(sidebarOpen || isMobile) && (
            <div className="flex items-center gap-2">
              <Store className="w-6 h-6" />
              <h1 className="text-xl font-bold truncate">Seller Panel</h1>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-green-800 rounded-lg transition-colors flex-shrink-0 ml-auto"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen || isMobile ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-green-600 text-white shadow-lg"
                    : "text-green-100 hover:bg-green-800 hover:text-white"
                } ${!sidebarOpen && !isMobile ? "justify-center" : ""}`}
                title={!sidebarOpen && !isMobile ? item.label : undefined}
              >
                <Icon size={20} className="flex-shrink-0" />
                {(sidebarOpen || isMobile) && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-green-600 p-4">
          {(sidebarOpen || isMobile) && (shopName || sellerName) && (
            <div className="mb-3 px-2 text-sm text-green-200 truncate">
              <div className="text-xs uppercase tracking-wide mb-1">
                {shopName ? "Shop" : "Seller"}
              </div>
              <div className="text-white font-medium truncate">
                {shopName || sellerName}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-4 py-2 text-red-200 hover:bg-red-900/30 hover:text-red-100 rounded-lg transition-colors ${
              !sidebarOpen && !isMobile ? "justify-center" : ""
            }`}
            title={!sidebarOpen && !isMobile ? "Logout" : undefined}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {(sidebarOpen || isMobile) && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full">
        {/* Mobile Header Bar */}
        {isMobile && (
          <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between md:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu size={24} className="text-gray-700" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              Seller Panel
            </h2>
            <div className="w-10" />
          </div>
        )}

        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
