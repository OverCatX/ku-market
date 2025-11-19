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
          <div className="w-1 h-8 bg-gradient-to-b from-[#A0704F] to-[#5a3f2a] rounded-full"></div>
          <div>
            <h1 className="text-3xl font-bold text-[#421404]">Dashboard</h1>
            <p className="text-[#A0704F] mt-1">
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
          color="#562c1e"
          borderColor="#562c1e"
          titleColor="#562c1e"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={Clock}
          color="#903500"
          borderColor="#903500"
          titleColor="#903500"
        />
        <StatCard
          title="Total Items"
          value={stats.totalItems}
          icon={Package}
          color="#8c522f"
          borderColor="#8c522f"
          titleColor="#8c522f"
        />
        <StatCard
          title="Total Revenue"
          value={`฿${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="#A0704F"
          borderColor="#A0704F"
          titleColor="#A0704F"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
        <h2 className="text-xl font-bold text-[#421404] mb-5 flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-[#A0704F] to-[#5a3f2a] rounded-full"></div>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/seller/add-item"
            className="flex items-center gap-4 p-5 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#8c522f] hover:bg-gradient-to-br hover:from-[#8c522f]/10 hover:to-[#8c522f]/5 transition-all group hover:shadow-md"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#8c522f]/20 to-[#8c522f]/30 rounded-xl flex items-center justify-center group-hover:from-[#8c522f]/30 group-hover:to-[#8c522f]/40 transition-all shadow-sm">
              <Package
                size={22}
                className="text-[#8c522f] group-hover:scale-110 transition-transform"
              />
            </div>
            <div>
              <div className="font-semibold text-gray-900 group-hover:text-[#8c522f] transition-colors">
                Add New Item
              </div>
              <div className="text-sm text-gray-600 group-hover:text-gray-700">
                List a product for sale
              </div>
            </div>
          </Link>

          <Link
            href="/seller/orders"
            className="flex items-center gap-4 p-5 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#562c1e] hover:bg-gradient-to-br hover:from-[#562c1e]/10 hover:to-[#562c1e]/5 transition-all group hover:shadow-md"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#562c1e]/20 to-[#562c1e]/30 rounded-xl flex items-center justify-center group-hover:from-[#562c1e]/30 group-hover:to-[#562c1e]/40 transition-all shadow-sm">
              <ShoppingBag
                size={22}
                className="text-[#562c1e] group-hover:scale-110 transition-transform"
              />
            </div>
            <div>
              <div className="font-semibold text-gray-900 group-hover:text-[#562c1e] transition-colors">
                View Orders
              </div>
              <div className="text-sm text-gray-600 group-hover:text-gray-700">
                Manage your orders
              </div>
            </div>
          </Link>

          <Link
            href="/seller/items"
            className="flex items-center gap-4 p-5 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#A0704F] hover:bg-gradient-to-br hover:from-[#A0704F]/10 hover:to-[#A0704F]/5 transition-all group hover:shadow-md"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#A0704F]/20 to-[#A0704F]/30 rounded-xl flex items-center justify-center group-hover:from-[#A0704F]/30 group-hover:to-[#A0704F]/40 transition-all shadow-sm">
              <CheckCircle
                size={22}
                className="text-[#A0704F] group-hover:scale-110 transition-transform"
              />
            </div>
            <div>
              <div className="font-semibold text-gray-900 group-hover:text-[#A0704F] transition-colors">
                Manage Items
              </div>
              <div className="text-sm text-gray-600 group-hover:text-gray-700">
                Edit your listings
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-[#421404] mb-5 flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-[#A0704F] to-[#5a3f2a] rounded-full"></div>
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
            <div className="p-5 bg-[#A0704F]/10 border border-[#A0704F]/20 rounded-xl text-center">
              <div className="flex flex-col items-center gap-2">
                <CheckCircle size={32} className="text-[#A0704F]" />
                <p className="text-[#A0704F] font-medium">
                  No pending orders at the moment
                </p>
                <p className="text-sm text-[#A0704F]">All caught up!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
