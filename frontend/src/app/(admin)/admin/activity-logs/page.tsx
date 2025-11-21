"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  getActivityLogs,
  getActivityLogStats,
  type ActivityLog,
  type ActivityLogStats,
} from "@/config/admin";
import toast from "react-hot-toast";
import {
  RefreshCw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";

const ITEMS_PER_PAGE = 50;

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  payment_submitted: "Payment Submitted",
  payment_confirmed: "Payment Confirmed",
  payment_qr_generated: "QR Code Generated",
  order_created: "Order Created",
  order_confirmed: "Order Confirmed",
  order_rejected: "Order Rejected",
  order_completed: "Order Completed",
  order_cancelled: "Order Cancelled",
  buyer_received: "Buyer Received",
  seller_delivered: "Seller Delivered",
  review_created: "Review Created",
  review_deleted: "Review Deleted",
  item_created: "Item Created",
  item_updated: "Item Updated",
  item_deleted: "Item Deleted",
  shop_created: "Shop Created",
  shop_updated: "Shop Updated",
  shop_deleted: "Shop Deleted",
  shop_cancelled: "Shop Cancelled",
  verification_submitted: "Verification Submitted",
  verification_approved: "Verification Approved",
  verification_rejected: "Verification Rejected",
  user_login: "User Login",
  user_logout: "User Logout",
  profile_updated: "Profile Updated",
  report_submitted: "Report Submitted",
  report_item_submitted: "Item Report Submitted",
  admin_verification_approved: "Admin: Verification Approved",
  admin_verification_rejected: "Admin: Verification Rejected",
  admin_shop_approved: "Admin: Shop Approved",
  admin_shop_rejected: "Admin: Shop Rejected",
  admin_item_approved: "Admin: Item Approved",
  admin_item_rejected: "Admin: Item Rejected",
  admin_item_updated: "Admin: Item Updated",
  admin_item_deleted: "Admin: Item Deleted",
  admin_review_deleted: "Admin: Review Deleted",
  admin_user_deleted: "Admin: User Deleted",
  admin_user_promoted: "Admin: User Promoted",
  admin_user_demoted: "Admin: User Demoted",
  admin_meetup_preset_created: "Admin: Meetup Preset Created",
  admin_meetup_preset_updated: "Admin: Meetup Preset Updated",
  admin_meetup_preset_deleted: "Admin: Meetup Preset Deleted",
};

const ROLE_COLORS: Record<string, string> = {
  buyer: "bg-blue-100 text-blue-800",
  seller: "bg-green-100 text-green-800",
  admin: "bg-purple-100 text-purple-800",
};

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityLogStats["stats"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [userRole, setUserRole] = useState<string>("");
  const [activityType, setActivityType] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page,
        limit: ITEMS_PER_PAGE,
      };

      if (search) params.search = search;
      if (userRole) params.userRole = userRole;
      if (activityType) params.activityType = activityType;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await getActivityLogs(params);
      setLogs(response.logs);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error("Failed to load logs:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load activity logs"
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, userRole, activityType, startDate, endDate]);

  const loadStats = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await getActivityLogStats(params);
      setStats(response.stats);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleSearch = useCallback(() => {
    setPage(1);
    loadLogs();
  }, [loadLogs]);

  const handleResetFilters = useCallback(() => {
    setSearch("");
    setUserRole("");
    setActivityType("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm:ss");
    } catch {
      return dateString;
    }
  };

  const activityTypes = useMemo(() => {
    return Object.keys(ACTIVITY_TYPE_LABELS);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Activity Logs
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Monitor all user and system activities
          </p>
        </div>
        <button
          onClick={() => {
            loadLogs();
            loadStats();
          }}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total Logs</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalLogs.toLocaleString()}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">By Role</div>
            <div className="space-y-1">
              {Object.entries(stats.logsByRole).map(([role, count]) => (
                <div key={role} className="flex justify-between text-sm">
                  <span className="capitalize">{role}:</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Top Activities</div>
            <div className="space-y-1">
              {Object.entries(stats.logsByType)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span className="truncate">{ACTIVITY_TYPE_LABELS[type] || type}:</span>
                    <span className="font-semibold ml-2">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            {showFilters ? "Hide" : "Show"} Filters
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by description, user name, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84B067]"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-[#84B067] text-white rounded-lg hover:bg-[#69773D] transition-colors"
          >
            Search
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Role
              </label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84B067]"
              >
                <option value="">All Roles</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Activity Type
              </label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84B067]"
              >
                <option value="">All Activities</option>
                {activityTypes.map((type) => (
                  <option key={type} value={type}>
                    {ACTIVITY_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84B067]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84B067]"
              />
            </div>
          </div>
        )}

        {(search || userRole || activityType || startDate || endDate) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleResetFilters}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{log.userName}</div>
                        <div className="text-gray-500">{log.userEmail}</div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${ROLE_COLORS[log.userRole] || "bg-gray-100 text-gray-800"}`}
                        >
                          {log.userRole}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {ACTIVITY_TYPE_LABELS[log.activityType] || log.activityType}
                        </div>
                        <div className="text-gray-500 text-xs">{log.entityType}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{log.description}</div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <details className="mt-1">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            View Details
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {log.ipAddress || "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(page * ITEMS_PER_PAGE, total)} of {total} logs
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

