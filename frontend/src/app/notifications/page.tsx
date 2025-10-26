"use client";

import { useState, useEffect } from "react";
import { Bell, Package, MessageCircle, ShoppingBag, AlertCircle, Trash2, CheckCheck, Filter } from "lucide-react";
import type { Notification } from "@/components/notifications";
// import { getNotifications } from "@/config/notifications"; // Uncomment when backend is ready

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call when backend is ready
    // getNotifications().then(data => {
    //   setNotifications(data.notifications);
    //   setLoading(false);
    // }).catch(err => {
    //   console.error(err);
    //   setLoading(false);
    // });
    
    // For now, just show empty state
    setTimeout(() => {
      setNotifications([]);
      setLoading(false);
    }, 500);
  }, []);

  const filteredNotifications = notifications.filter((notification) => {
    // Apply read/unread filter
    if (filter === "unread" && notification.read) return false;
    if (filter === "read" && !notification.read) return false;

    // Apply type filter
    if (typeFilter !== "all" && notification.type !== typeFilter) return false;

    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "order":
        return <Package className="w-6 h-6 text-blue-500" />;
      case "message":
        return <MessageCircle className="w-6 h-6 text-green-500" />;
      case "item":
        return <ShoppingBag className="w-6 h-6 text-purple-500" />;
      case "system":
        return <AlertCircle className="w-6 h-6 text-orange-500" />;
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

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-600">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
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
                  onChange={(e) => setFilter(e.target.value as "all" | "unread" | "read")}
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

            {/* Actions */}
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Mark all as read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
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
              {notifications.length === 0 ? "No notifications yet" : "No notifications match your filters"}
            </h3>
            <p className="text-gray-500">
              {notifications.length === 0
                ? "When you receive notifications, they'll appear here"
                : "Try changing your filter settings"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm p-5 transition hover:shadow-md ${
                  !notification.read ? "border-l-4 border-[#84B067]" : ""
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
                            <span className="w-2 h-2 bg-[#84B067] rounded-full"></span>
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
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Mark as read"
                          >
                            <CheckCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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
        )}
      </div>
    </div>
  );
}

