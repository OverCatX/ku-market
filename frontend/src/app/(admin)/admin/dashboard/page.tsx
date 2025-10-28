"use client";

import { useEffect, useState, memo } from "react";
import { getStats } from "@/config/admin";
import toast from "react-hot-toast";
import { Users, FileCheck, Store, TrendingUp } from "lucide-react";
import Link from "next/link";

interface AdminStats {
  totalUsers: number;
  pendingVerifications: number;
  pendingShops: number;
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: "blue" | "green" | "orange" | "purple";
  link?: string;
}

const colorClasses = {
  blue: "bg-blue-100 text-blue-600 border-blue-200",
  green: "bg-green-100 text-green-600 border-green-200",
  orange: "bg-orange-100 text-orange-600 border-orange-200",
  purple: "bg-purple-100 text-purple-600 border-purple-200",
};

const StatCard = memo(function StatCard({
  icon: Icon,
  label,
  value,
  color,
  link,
}: StatCardProps): JSX.Element {
  const content = (
    <div
      className={`p-6 rounded-lg border-2 ${colorClasses[color]} ${
        link ? "hover:shadow-lg transition-shadow cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon size={32} />
        <div className="text-3xl font-bold">{value}</div>
      </div>
      <div className="font-medium">{label}</div>
    </div>
  );

  return link ? <Link href={link}>{content}</Link> : content;
});

export default function AdminDashboard(): JSX.Element {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async (): Promise<void> => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const data = await getStats(token);
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
    <div>
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Dashboard
        </h1>
        <p className="text-sm md:text-base text-gray-600">
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
            color="blue"
          />
          <StatCard
            icon={FileCheck}
            label="Pending Verifications"
            value={stats.pendingVerifications}
            color="orange"
            link="/admin/verifications"
          />
          <StatCard
            icon={Store}
            label="Pending Shops"
            value={stats.pendingShops}
            color="purple"
            link="/admin/shops"
          />
          <StatCard
            icon={TrendingUp}
            label="Active Items"
            value={0}
            color="green"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
          <Link
            href="/admin/verifications"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <FileCheck className="text-blue-600" size={24} />
            <div>
              <div className="font-semibold text-gray-900">
                Review Verifications
              </div>
              <div className="text-sm text-gray-600">
                Approve or reject identity verifications
              </div>
            </div>
          </Link>
          <Link
            href="/admin/shops"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
          >
            <Store className="text-purple-600" size={24} />
            <div>
              <div className="font-semibold text-gray-900">
                Review Shop Requests
              </div>
              <div className="text-sm text-gray-600">
                Approve or reject new shop applications
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
