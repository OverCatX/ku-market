"use client";

import { useEffect, useState, memo } from "react";
import { getStats } from "@/config/admin";
import toast from "react-hot-toast";
import {
  Users,
  FileCheck,
  Store,
  Package,
  UserCog,
  FolderTree,
  Flag,
  HelpCircle,
  Activity,
  MapPin,
} from "lucide-react";
import Link from "next/link";

interface AdminStats {
  totalUsers: number;
  pendingVerifications: number;
  pendingShops: number;
  pendingItems?: number;
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  borderColor?: string;
  titleColor?: string;
  link?: string;
}

const StatCard = memo(function StatCard({
  icon: Icon,
  label,
  value,
  color,
  borderColor,
  titleColor,
  link,
}: StatCardProps) {
  const content = (
    <div
      className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border-l-4 relative overflow-hidden group h-full ${
        link ? "cursor-pointer" : ""
      }`}
      style={{ borderLeftColor: borderColor || color }}
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ borderColor: color }}
      />
      <div className="relative flex items-center justify-between h-full">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: titleColor || borderColor || color }}>
            {label}
          </p>
          <p className="text-3xl font-bold mt-3" style={{ color: titleColor || borderColor || color }}>{value}</p>
        </div>
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-110"
          style={{
            backgroundColor: color + "15",
            border: `2px solid ${color}40`,
          }}
        >
          <Icon size={28} style={{ color }} />
        </div>
      </div>
      <div
        className="absolute top-0 right-0 w-20 h-20 opacity-10"
        style={{ borderColor: color }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: color, transform: "translate(30%, -30%)" }}
        />
      </div>
    </div>
  );

  return link ? <Link href={link}>{content}</Link> : content;
});

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async (): Promise<void> => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load stats"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F6F2E5', minHeight: '100vh', padding: '2rem' }}>
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#4A5130] mb-2">
          Dashboard
        </h1>
        <p className="text-sm md:text-base text-[#69773D]">
          Overview of your marketplace administration
        </p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats.totalUsers}
            color="#2F5A32"
            borderColor="#2F5A32"
            titleColor="#4A5130"
          />
          <StatCard
            icon={FileCheck}
            label="Pending Verifications"
            value={stats.pendingVerifications}
            color="#5C8140"
            borderColor="#5C8140"
            titleColor="#4A5130"
            link="/admin/verifications"
          />
          <StatCard
            icon={Store}
            label="Pending Shops"
            value={stats.pendingShops}
            color="#7ba02e"
            borderColor="#7ba02e"
            titleColor="#4A5130"
            link="/admin/shops"
          />
          <StatCard
            icon={Package}
            label="Pending Items"
            value={stats.pendingItems || 0}
            color="#8fb88f"
            borderColor="#8fb88f"
            titleColor="#4A5130"
            link="/admin/items"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-bold text-[#4A5130]">Quick Actions</h2>
          <Link
            href="/guide"
            className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-[#69773D] text-white rounded-lg hover:bg-[#5a632d] transition-colors text-xs md:text-sm font-medium shadow-sm hover:shadow-md"
          >
            <HelpCircle size={16} className="md:w-[18px] md:h-[18px]" />
            <span className="hidden sm:inline">User Guide</span>
            <span className="sm:hidden">Guide</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
          <Link
            href="/admin/verifications"
            className="flex items-center gap-4 p-5 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#2F5A32] hover:bg-gradient-to-br hover:from-[#2F5A32]/10 hover:to-[#2F5A32]/5 transition-all group hover:shadow-md"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#2F5A32]/20 to-[#2F5A32]/30 rounded-xl flex items-center justify-center group-hover:from-[#2F5A32]/30 group-hover:to-[#2F5A32]/40 transition-all shadow-sm">
              <FileCheck
                size={22}
                className="text-[#2F5A32] group-hover:scale-110 transition-transform"
              />
            </div>
            <div>
              <div className="font-semibold text-[#4A5130] group-hover:text-[#2F5A32] transition-colors">
                Review Verifications
              </div>
              <div className="text-sm text-[#69773D] group-hover:text-gray-700">
                Approve or reject identity verifications
              </div>
            </div>
          </Link>

          <Link
            href="/admin/shops"
            className="flex items-center gap-4 p-5 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#5C8140] hover:bg-gradient-to-br hover:from-[#5C8140]/10 hover:to-[#5C8140]/5 transition-all group hover:shadow-md"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#5C8140]/20 to-[#5C8140]/30 rounded-xl flex items-center justify-center group-hover:from-[#5C8140]/30 group-hover:to-[#5C8140]/40 transition-all shadow-sm">
              <Store
                size={22}
                className="text-[#5C8140] group-hover:scale-110 transition-transform"
              />
            </div>
            <div>
              <div className="font-semibold text-[#4A5130] group-hover:text-[#5C8140] transition-colors">
                Review Shop Requests
              </div>
              <div className="text-sm text-[#69773D] group-hover:text-gray-700">
                Approve or reject new shop applications
              </div>
            </div>
          </Link>

          <Link
            href="/admin/items"
            className="flex items-center gap-4 p-5 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#7ba02e] hover:bg-gradient-to-br hover:from-[#7ba02e]/10 hover:to-[#7ba02e]/5 transition-all group hover:shadow-md"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#7ba02e]/20 to-[#7ba02e]/30 rounded-xl flex items-center justify-center group-hover:from-[#7ba02e]/30 group-hover:to-[#7ba02e]/40 transition-all shadow-sm">
              <Package
                size={22}
                className="text-[#7ba02e] group-hover:scale-110 transition-transform"
              />
            </div>
            <div>
              <div className="font-semibold text-[#4A5130] group-hover:text-[#7ba02e] transition-colors">
                Review Items
              </div>
              <div className="text-sm text-[#69773D] group-hover:text-gray-700">
                Approve or reject item listings
              </div>
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="flex items-center gap-4 p-5 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#8fb88f] hover:bg-gradient-to-br hover:from-[#8fb88f]/10 hover:to-[#8fb88f]/5 transition-all group hover:shadow-md"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#8fb88f]/20 to-[#8fb88f]/30 rounded-xl flex items-center justify-center group-hover:from-[#8fb88f]/30 group-hover:to-[#8fb88f]/40 transition-all shadow-sm">
              <UserCog
                size={22}
                className="text-[#8fb88f] group-hover:scale-110 transition-transform"
              />
            </div>
            <div>
              <div className="font-semibold text-[#4A5130] group-hover:text-[#8fb88f] transition-colors">
                Manage Users
              </div>
              <div className="text-sm text-[#69773D] group-hover:text-gray-700">
                Promote, demote, or remove marketplace users
              </div>
            </div>
          </Link>

          <Link
            href="/admin/categories"
            className="flex items-center gap-4 p-5 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#A7D2A5] hover:bg-gradient-to-br hover:from-[#A7D2A5]/10 hover:to-[#A7D2A5]/5 transition-all group hover:shadow-md"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#A7D2A5]/20 to-[#A7D2A5]/30 rounded-xl flex items-center justify-center group-hover:from-[#A7D2A5]/30 group-hover:to-[#A7D2A5]/40 transition-all shadow-sm">
              <FolderTree
                size={22}
                className="text-[#A7D2A5] group-hover:scale-110 transition-transform"
              />
            </div>
            <div>
              <div className="font-semibold text-[#4A5130] group-hover:text-[#A7D2A5] transition-colors">
                Manage Categories
              </div>
              <div className="text-sm text-[#69773D] group-hover:text-gray-700">
                Add, edit, or remove marketplace categories
              </div>
            </div>
          </Link>

          <Link
            href="/admin/reports"
            className="flex items-center gap-4 p-5 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#780606] hover:bg-gradient-to-br hover:from-[#780606]/10 hover:to-[#780606]/5 transition-all group hover:shadow-md"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#780606]/20 to-[#780606]/30 rounded-xl flex items-center justify-center group-hover:from-[#780606]/30 group-hover:to-[#780606]/40 transition-all shadow-sm">
              <Flag
                size={22}
                className="text-[#780606] group-hover:scale-110 transition-transform"
              />
            </div>
            <div>
              <div className="font-semibold text-[#4A5130] group-hover:text-[#780606] transition-colors">
                Review Reports
              </div>
              <div className="text-sm text-[#69773D] group-hover:text-gray-700">
                Investigate user and item reports
              </div>
            </div>
          </Link>

          <Link
            href="/admin/meetup-presets"
            className="flex items-center gap-4 p-5 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#69773D] hover:bg-gradient-to-br hover:from-[#69773D]/10 hover:to-[#69773D]/5 transition-all group hover:shadow-md"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#69773D]/20 to-[#69773D]/30 rounded-xl flex items-center justify-center group-hover:from-[#69773D]/30 group-hover:to-[#69773D]/40 transition-all shadow-sm">
              <MapPin
                size={22}
                className="text-[#69773D] group-hover:scale-110 transition-transform"
              />
            </div>
            <div>
              <div className="font-semibold text-[#4A5130] group-hover:text-[#69773D] transition-colors">
                Meetup Presets
              </div>
              <div className="text-sm text-[#69773D] group-hover:text-gray-700">
                Manage pickup locations and meetup points
              </div>
            </div>
          </Link>

          <Link
            href="/admin/activity-logs"
            className="flex items-center gap-4 p-5 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#92bf37] hover:bg-gradient-to-br hover:from-[#92bf37]/10 hover:to-[#92bf37]/5 transition-all group hover:shadow-md"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#92bf37]/20 to-[#92bf37]/30 rounded-xl flex items-center justify-center group-hover:from-[#92bf37]/30 group-hover:to-[#92bf37]/40 transition-all shadow-sm">
              <Activity
                size={22}
                className="text-[#92bf37] group-hover:scale-110 transition-transform"
              />
            </div>
            <div>
              <div className="font-semibold text-[#4A5130] group-hover:text-[#92bf37] transition-colors">
                Activity Logs
              </div>
              <div className="text-sm text-[#69773D] group-hover:text-gray-700">
                View all user activities and system logs
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
