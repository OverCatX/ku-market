"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FileCheck,
  Store,
  Users,
  Package,
  FolderTree,
  Flag,
  LogOut,
  Menu,
  X,
  MapPin,
} from "lucide-react";
import Link from "next/link";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Verifications", path: "/admin/verifications", icon: FileCheck },
  { label: "Shop Requests", path: "/admin/shops", icon: Store },
  { label: "Items", path: "/admin/items", icon: Package },
  { label: "Categories", path: "/admin/categories", icon: FolderTree },
  { label: "Meetup Presets", path: "/admin/meetup-presets", icon: MapPin },
  { label: "Reports", path: "/admin/reports", icon: Flag },
  { label: "Users", path: "/admin/users", icon: Users },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Closed by default on mobile
  const [adminName, setAdminName] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setSidebarOpen(window.innerWidth >= 768); // Open on desktop, closed on mobile
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === "/admin/login") return;

    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.replace("/admin/login");
      return;
    }

    try {
      const user = JSON.parse(userStr) as { role?: string; name?: string };
      if (user.role !== "admin") {
        router.replace("/admin/login");
        return;
      }
      setAdminName(user.name || "Admin");
    } catch {
      router.replace("/admin/login");
    }
  }, [pathname, router]);

  const handleLogout = (): void => {
    // Clear all localStorage data (including old sessions)
    localStorage.clear();
    router.replace("/admin/login");
  };

  const handleNavClick = (): void => {
    // Close sidebar on mobile when clicking a nav link
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Login page doesn't need sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
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
        } bg-gray-900 text-white transition-transform duration-300 ease-in-out md:transition-all flex flex-col fixed md:relative z-50 h-full shadow-xl md:shadow-none`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-700 min-h-[65px]">
          {(sidebarOpen || isMobile) && (
            <h1 className="text-xl font-bold truncate">Admin Portal</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0 ml-auto"
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
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
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
        <div className="border-t border-gray-700 p-4">
          {(sidebarOpen || isMobile) && adminName && (
            <div className="mb-3 px-2 text-sm text-gray-400 truncate">
              <div className="text-xs uppercase tracking-wide mb-1">
                Logged in as
              </div>
              <div className="text-white font-medium truncate">{adminName}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-4 py-2 text-[#780606] hover:bg-[#780606]/30 hover:text-[#780606] rounded-lg transition-colors ${
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
            <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
            <div className="w-10" /> {/* Spacer for center alignment */}
          </div>
        )}

        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
