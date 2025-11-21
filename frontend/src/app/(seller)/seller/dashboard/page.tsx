"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Package,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { API_BASE } from "@/config/constants";

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalItems: number;
  totalRevenue: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  borderColor?: string;
  titleColor?: string;
  trend?: string;
}

function StatCard({ title, value, icon: Icon, color, borderColor, titleColor, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border-l-4 relative overflow-hidden group" style={{ borderLeftColor: borderColor || color }}>
      <div
        className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ borderColor: color }}
      />
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: titleColor || borderColor || color }}>
            {title}
          </p>
          <p className="text-3xl font-bold mt-3" style={{ color: titleColor || borderColor || color }}>{value}</p>
          {trend && (
            <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1 font-medium">
              <TrendingUp size={14} />
              {trend}
            </p>
          )}
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
}

export default function SellerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalItems: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async (): Promise<void> => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authentication");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/seller/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to load stats");
      }

      const data = await response.json();
      setStats({
        totalOrders: data.totalOrders || 0,
        pendingOrders: data.pendingOrders || 0,
        totalItems: data.totalItems || 0,
        totalRevenue: data.totalRevenue || 0,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
      setStats({
        totalOrders: 0,
        pendingOrders: 0,
        totalItems: 0,
        totalRevenue: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F6F2E5', minHeight: '100vh', padding: '2rem' }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-gradient-to-b from-[#8B9B6E] via-[#6B7B4E] to-[#2d3220] rounded-full"></div>
          <div>
            <h1 className="text-3xl font-bold text-[#4A5130]">Dashboard</h1>
            <p className="text-[#69773D] mt-1">
              Welcome back! Here&apos;s your store overview.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          color="#2F5A32"
          borderColor="#2F5A32"
          titleColor="#2F5A32"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={Clock}
          color="#5C8140"
          borderColor="#5C8140"
          titleColor="#5C8140"
        />
        <StatCard
          title="Total Items"
          value={stats.totalItems}
          icon={Package}
          color="#7ba02e"
          borderColor="#7ba02e"
          titleColor="#7ba02e"
        />
        <StatCard
          title="Total Revenue"
          value={`฿${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="#8fb88f"
          borderColor="#8fb88f"
          titleColor="#8fb88f"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-[#4A5130] flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-[#8B9B6E] via-[#6B7B4E] to-[#2d3220] rounded-full"></div>
            Quick Actions
          </h2>
          <Link
            href="/guide"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#69773D] text-white rounded-lg hover:bg-[#5a632d] transition-colors text-sm font-medium shadow-sm hover:shadow-md"
          >
            <HelpCircle size={18} />
            User Guide
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/seller/add-item"
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
                Add New Item
              </div>
              <div className="text-sm text-[#69773D] group-hover:text-gray-700">
                List a product for sale
              </div>
            </div>
          </Link>

          <Link
            href="/seller/orders"
            className="flex items-center gap-4 p-5 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#2F5A32] hover:bg-gradient-to-br hover:from-[#2F5A32]/10 hover:to-[#2F5A32]/5 transition-all group hover:shadow-md"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#2F5A32]/20 to-[#2F5A32]/30 rounded-xl flex items-center justify-center group-hover:from-[#2F5A32]/30 group-hover:to-[#2F5A32]/40 transition-all shadow-sm">
              <ShoppingBag
                size={22}
                className="text-[#2F5A32] group-hover:scale-110 transition-transform"
              />
            </div>
            <div>
              <div className="font-semibold text-[#4A5130] group-hover:text-[#2F5A32] transition-colors">
                View Orders
              </div>
              <div className="text-sm text-[#69773D] group-hover:text-gray-700">
                Manage your orders
              </div>
            </div>
          </Link>

          <Link
            href="/seller/items"
            className="flex items-center gap-4 p-5 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#8fb88f] hover:bg-gradient-to-br hover:from-[#8fb88f]/10 hover:to-[#8fb88f]/5 transition-all group hover:shadow-md"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#8fb88f]/20 to-[#8fb88f]/30 rounded-xl flex items-center justify-center group-hover:from-[#8fb88f]/30 group-hover:to-[#8fb88f]/40 transition-all shadow-sm">
              <CheckCircle
                size={22}
                className="text-[#8fb88f] group-hover:scale-110 transition-transform"
              />
            </div>
            <div>
              <div className="font-semibold text-[#4A5130] group-hover:text-[#8fb88f] transition-colors">
                Manage Items
              </div>
              <div className="text-sm text-[#69773D] group-hover:text-gray-700">
                Edit your listings
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-[#4A5130] mb-5 flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-[#8B9B6E] via-[#6B7B4E] to-[#2d3220] rounded-full"></div>
          Recent Activity
        </h2>
        <div className="space-y-4">
          {stats.pendingOrders > 0 ? (
            <div className="p-5 bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock size={22} className="text-amber-600" />
                </div>
                <div>
                  <span className="font-semibold text-amber-900 block">
                    {stats.pendingOrders} Pending Order
                    {stats.pendingOrders > 1 ? "s" : ""}
                  </span>
                  <span className="text-sm text-amber-700 mt-0.5 block">
                    Waiting for your confirmation
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 bg-[#69773D]/10 border border-[#69773D]/20 rounded-xl text-center">
              <div className="flex flex-col items-center gap-2">
                <CheckCircle size={32} className="text-[#69773D]" />
                <p className="text-[#69773D] font-medium">
                  No pending orders at the moment
                </p>
                <p className="text-sm text-[#69773D]">All caught up!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
