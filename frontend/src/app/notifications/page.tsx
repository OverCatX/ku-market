"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Package,
  MessageCircle,
  ShoppingBag,
  AlertCircle,
  Trash2,
  CheckCheck,
  Filter,
} from "lucide-react";
import type { Notification } from "@/components/notifications";
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification, 
  clearAllNotifications 
} from "@/config/notifications";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("authentication");

    if (!token) {
      router.push("/login");
      return;
    }

    setIsAuthenticated(true);

    // Fetch first page of notifications
    loadNotifications(1, true);
  }, [router]);

  const loadNotifications = async (pageNum: number, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setNotifications([]);
      } else {
        setLoadingMore(true);
      }

      const data = await getNotifications(pageNum, 20);
      
      if (reset) {
        setNotifications(data.notifications);
      } else {
        setNotifications((prev) => [...prev, ...data.notifications]);
      }

      setHasMore(data.pagination?.hasMore || false);
      setTotalCount(data.pagination?.totalCount || 0);
      setUnreadCount(data.unreadCount);
      setPage(pageNum);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      if (reset) {
        setNotifications([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadNotifications(page + 1, false);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    // Apply read/unread filter
    if (filter === "unread" && notification.read) return false;
    if (filter === "read" && !notification.read) return false;

    // Apply type filter
    if (typeFilter !== "all" && notification.type !== typeFilter) return false;

    return true;
  });

  const markAsRead = async (notificationId: string) => {
    // Update UI optimistically (immediately)
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === notificationId && !n.read) {
          setUnreadCount((count) => Math.max(0, count - 1));
          return { ...n, read: true };
        }
        return n;
      })
    );
    // Call API in background
    try {
      await markNotificationAsRead(notificationId);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      // Revert on error
      setNotifications((prev) =>
        prev.map((n) => {
          if (n.id === notificationId) {
            setUnreadCount((count) => count + 1);
            return { ...n, read: false };
          }
          return n;
        })
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) => {
        const updated = prev.filter((n) => n.id !== notificationId);
        setTotalCount((count) => Math.max(0, count - 1));
        return updated;
      });
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      setNotifications([]);
      setTotalCount(0);
      setHasMore(false);
      setPage(1);
    } catch (err) {
      console.error("Failed to clear all notifications:", err);
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "order":
        return <Package className="w-6 h-6 text-[#69773D]" />;
      case "message":
        return <MessageCircle className="w-6 h-6 text-[#84B067]" />;
      case "item":
        return <ShoppingBag className="w-6 h-6 text-[#7BAA5F]" />;
      case "system":
        return <AlertCircle className="w-6 h-6 text-[#A0704F]" />;
      default:
        return <Bell className="w-6 h-6 text-gray-500" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Group notifications by date
  const groupNotificationsByDate = (notifications: Notification[]) => {
    const groups: { [key: string]: Notification[] } = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    notifications.forEach((notification) => {
      const notifDate = new Date(notification.timestamp);
      const notifDateOnly = new Date(notifDate.getFullYear(), notifDate.getMonth(), notifDate.getDate());

      let groupKey: string;
      if (notifDateOnly.getTime() === today.getTime()) {
        groupKey = "Today";
      } else if (notifDateOnly.getTime() === yesterday.getTime()) {
        groupKey = "Yesterday";
      } else if (notifDate >= thisWeek) {
        groupKey = "This Week";
      } else {
        groupKey = notifDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });

    return groups;
  };

  const handleNotificationClick = (notification: Notification) => {
    // Navigate first immediately (don't wait for mark as read)
    if (notification.link) {
      // Mark as read in the background (fire and forget)
      if (!notification.read) {
        // Update UI optimistically
        setNotifications((prev) =>
          prev.map((n) => {
            if (n.id === notification.id && !n.read) {
              setUnreadCount((count) => Math.max(0, count - 1));
              return { ...n, read: true };
            }
            return n;
          })
        );
        // Call API in background without waiting
        markNotificationAsRead(notification.id).catch((err) => {
          console.error("Failed to mark notification as read:", err);
          // Revert on error
          setNotifications((prev) =>
            prev.map((n) => {
              if (n.id === notification.id) {
                setUnreadCount((count) => count + 1);
                return { ...n, read: false };
              }
              return n;
            })
          );
        });
      }
      // Navigate immediately using router for smoother navigation
      router.push(notification.link);
    }
  };

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-4xl">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Notifications
          </h1>
          <p className="text-gray-600">
            {totalCount > 0
              ? `${totalCount} total notification${totalCount > 1 ? "s" : ""}${
                  unreadCount > 0
                    ? ` • ${unreadCount} unread`
                    : ""
                }`
              : unreadCount > 0
              ? `You have ${unreadCount} unread notification${
                  unreadCount > 1 ? "s" : ""
                }`
              : "You're all caught up!"}
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Read/Unread Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) =>
                    setFilter(e.target.value as "all" | "unread" | "read")
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#84B067]"
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#84B067]"
              >
                <option value="all">All Types</option>
                <option value="order">Orders</option>
                <option value="message">Messages</option>
                <option value="item">Items</option>
                <option value="system">System</option>
              </select>
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setFilter("all");
                  setTypeFilter("all");
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  filter === "all" && typeFilter === "all"
                    ? "bg-gradient-to-r from-[#69773D] to-[#84B067] text-white shadow-md"
                    : "bg-white border border-gray-300 text-gray-700 hover:border-[#69773D]"
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  // Toggle: if already "unread", reset to "all"
                  setFilter(filter === "unread" ? "all" : "unread");
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  filter === "unread"
                    ? "bg-gradient-to-r from-[#69773D] to-[#84B067] text-white shadow-md"
                    : "bg-white border border-gray-300 text-gray-700 hover:border-[#69773D]"
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => {
                  // Toggle: if already "order", reset to "all"
                  setTypeFilter(typeFilter === "order" ? "all" : "order");
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  typeFilter === "order"
                    ? "bg-gradient-to-r from-[#69773D] to-[#84B067] text-white shadow-md"
                    : "bg-white border border-gray-300 text-gray-700 hover:border-[#69773D]"
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => {
                  // Toggle: if already "message", reset to "all"
                  setTypeFilter(typeFilter === "message" ? "all" : "message");
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  typeFilter === "message"
                    ? "bg-gradient-to-r from-[#69773D] to-[#84B067] text-white shadow-md"
                    : "bg-white border border-gray-300 text-gray-700 hover:border-[#69773D]"
                }`}
              >
                Messages
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-[#69773D] hover:bg-green-50 rounded-lg transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Mark all as read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-[#69773D] hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Clear all</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {notifications.length === 0
                ? "No notifications yet"
                : "No notifications match your filters"}
            </h3>
            <p className="text-gray-500">
              {notifications.length === 0
                ? "When you receive notifications, they'll appear here"
                : "Try changing your filter settings"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupNotificationsByDate(filteredNotifications)).map(
              ([groupKey, groupNotifications]) => (
                <div key={groupKey} className="space-y-3">
                  {/* Date Group Header */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-[#69773D]/10"></div>
                    <h2 className="text-sm font-semibold text-[#69773D] bg-[#F6F2E5] px-3 py-1 rounded-full">
                      {groupKey}
                    </h2>
                    <div className="flex-1 h-px bg-[#69773D]/10"></div>
                  </div>

                  {/* Notifications in this group */}
                  {groupNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`bg-white rounded-lg shadow-sm p-5 transition-all duration-200 hover:shadow-md border-l-4 ${
                        !notification.read 
                          ? "bg-green-50 border-[#69773D]" 
                          : "border-transparent"
                      } ${notification.link ? "cursor-pointer" : ""}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-4">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">
                                  {notification.title}
                                </h3>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-[#69773D] rounded-full animate-pulse"></span>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm mb-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400">
                                {formatTimestamp(notification.timestamp)}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              {!notification.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="p-2 text-[#69773D] hover:bg-green-50 rounded-lg transition-colors"
                                  title="Mark as read"
                                >
                                  <CheckCheck className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification.id);
                                }}
                                className="p-2 text-gray-500 hover:text-[#69773D] hover:bg-gray-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-6 text-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-6 py-3 bg-[#69773D] text-white rounded-lg font-medium hover:bg-[#84B067] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? "Loading..." : "Load More"}
            </button>
            {totalCount > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Showing {notifications.length} of {totalCount} notifications
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
