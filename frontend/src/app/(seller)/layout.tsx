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
    <div className="flex h-screen bg-gray-50 overflow-hidden print:block print:h-auto print:bg-white print:overflow-visible">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
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
        } bg-gradient-to-br from-[#A0704F] via-[#8a5f3f] to-[#7a5235] text-white transition-transform duration-300 ease-in-out md:transition-all flex flex-col fixed md:relative z-50 h-full shadow-2xl md:shadow-lg print:hidden`}
      >
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-[#A0704F]/30 min-h-[70px] bg-[#8a5f3f]/50 backdrop-blur-sm">
          {(sidebarOpen || isMobile) && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold truncate">Seller Panel</h1>
                <p className="text-xs text-white/80 truncate">Dashboard</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-all flex-shrink-0 ml-auto hover:scale-110"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen || isMobile ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/20 scale-[1.02]"
                    : "text-white/90 hover:bg-white/10 hover:text-white hover:scale-[1.01]"
                } ${!sidebarOpen && !isMobile ? "justify-center" : ""}`}
                title={!sidebarOpen && !isMobile ? item.label : undefined}
              >
                <Icon size={20} className={`flex-shrink-0 ${isActive ? "text-white" : ""}`} />
                {(sidebarOpen || isMobile) && (
                  <span className="truncate font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-[#A0704F]/30 p-4 bg-[#7a5235]/30 backdrop-blur-sm">
          {(sidebarOpen || isMobile) && (shopName || sellerName) && (
            <div className="mb-3 px-3 py-2 bg-[#F6F2E5] rounded-lg border border-[#F6F2E5]/10">
              <div className="text-xs uppercase tracking-wider mb-1 text-[#A0704F] font-semibold">
                {shopName ? "Shop" : "Seller"}
              </div>
              <div className="text-[#A0704F] font-semibold truncate">
                {shopName || sellerName}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-4 py-2.5 bg-[#780606] text-[#F6F2E5] hover:bg-[#5c0505] hover:text-[#F6F2E5] rounded-xl transition-all border border-[#780606] hover:border-[#5c0505] ${
              !sidebarOpen && !isMobile ? "justify-center" : ""
            }`}
            title={!sidebarOpen && !isMobile ? "Logout" : undefined}
          >
            <LogOut size={18} className="flex-shrink-0 text-[#F6F2E5]" />
            {(sidebarOpen || isMobile) && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full bg-gradient-to-br from-gray-50 to-gray-100 print:overflow-visible print:bg-white print:w-full print:p-0 print:m-0">
        {/* Mobile Header Bar */}
        {isMobile && (
          <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm px-4 py-3 flex items-center justify-between md:hidden backdrop-blur-sm bg-white/95">
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

        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 print:max-w-none print:m-0 print:p-0">{children}</div>
      </main>
    </div>
  );
}
