"use client";

import { Bell, X, CheckCheck, Package, MessageCircle, ShoppingBag, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification, 
  clearAllNotifications 
} from "@/config/notifications";

export interface Notification {
  id: string;
  type: "order" | "message" | "item" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

interface NotificationBellProps {
  initialNotifications?: Notification[];
}

export function NotificationBell({ initialNotifications = [] }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch notifications from backend (only recent ones for dropdown)
  const fetchNotifications = useCallback(async (showNotification = false) => {
    const token = localStorage.getItem("authentication");
    if (!token) {
      setNotifications([]);
      return;
    }

    try {
      // Only fetch first 20 notifications for dropdown (recent ones)
      const data = await getNotifications(1, 20);
      const newUnreadCount = data.notifications.filter(n => !n.read).length;
      
      // Check if there are new unread notifications
      if (showNotification) {
        setNotifications((currentNotifications) => {
          const currentUnreadCount = currentNotifications.filter(n => !n.read).length;
          if (newUnreadCount > currentUnreadCount && currentUnreadCount > 0) {
            // Show browser notification if permission granted
            if ("Notification" in window && Notification.permission === "granted") {
              const newNotifications = data.notifications.filter(
                n => !n.read && !currentNotifications.find(existing => existing.id === n.id)
              );
              if (newNotifications.length > 0) {
                new Notification(newNotifications[0].title, {
                  body: newNotifications[0].message,
                  icon: "/favicon.ico",
                  tag: newNotifications[0].id,
                });
              }
            }
          }
          return data.notifications;
        });
        setPreviousUnreadCount(newUnreadCount);
      } else {
        setNotifications(data.notifications);
        setPreviousUnreadCount(newUnreadCount);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      // Keep existing notifications on error
    }
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Fetch on mount and when dropdown opens
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Smart background polling: poll every 60s when page is visible, pause when hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, stop polling
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      } else {
        // Page is visible, start polling
        if (!pollingIntervalRef.current) {
          pollingIntervalRef.current = setInterval(() => {
            fetchNotifications(true); // Show browser notifications for new items
          }, 60000); // Poll every 60 seconds
        }
      }
    };

    // Start polling if page is visible
    if (!document.hidden) {
      pollingIntervalRef.current = setInterval(() => {
        fetchNotifications(true);
      }, 60000);
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchNotifications]);

  // Auto-refresh notifications every 30 seconds when dropdown is open
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isOpen, fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (notificationId: string) => {
    // Update UI optimistically (immediately)
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    // Call API in background
    try {
      await markNotificationAsRead(notificationId);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      // Revert on error
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: false } : n
        )
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    // Update UI optimistically (immediately)
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    // Call API in background
    try {
      await deleteNotification(notificationId);
    } catch (err) {
      console.error("Failed to delete notification:", err);
      // On error, we could optionally refetch to restore state
      // But for now, we'll leave it deleted
    }
  };

  const handleClearAll = async () => {
    try {
      // Update UI optimistically (immediately)
      setNotifications([]);
      // Call API in background
      await clearAllNotifications();
    } catch (err) {
      console.error("Failed to clear all notifications:", err);
      // On error, we could optionally refetch to restore state
      // But for now, we'll leave it cleared
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "order":
        return <Package className="w-5 h-5 text-[#69773D]" />;
      case "message":
        return <MessageCircle className="w-5 h-5 text-[#84B067]" />;
      case "item":
        return <ShoppingBag className="w-5 h-5 text-[#7BAA5F]" />;
      case "system":
        return <AlertCircle className="w-5 h-5 text-[#A0704F]" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification: Notification) => {
    // Navigate first immediately (don't wait for mark as read)
    if (notification.link) {
      // Mark as read in the background (fire and forget)
      if (!notification.read) {
        // Update UI optimistically
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
        // Call API in background without waiting
        markNotificationAsRead(notification.id).catch((err) => {
          console.error("Failed to mark notification as read:", err);
          // Revert on error
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notification.id ? { ...n, read: false } : n
            )
          );
        });
      }
      // Close dropdown and navigate immediately
      setIsOpen(false);
      window.location.href = notification.link;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          // Refresh notifications when opening dropdown
          if (!isOpen) {
            fetchNotifications();
          }
        }}
        className="relative flex items-center justify-center w-full h-full transition-all duration-300 group"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-800 group-hover:text-[#69773D] transition-all duration-300 z-10" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 bg-gradient-to-br from-[#69773D] to-[#84B067] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg ring-2 ring-white z-20 animate-pulse translate-x-1/2 -translate-y-1/2">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-[#69773D] hover:text-[#84B067] font-medium transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-gray-600 hover:text-[#69773D] font-medium transition-colors"
                  title="Clear all"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Bell className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-all duration-200 cursor-pointer relative border-l-4 ${
                      !notification.read 
                        ? "bg-green-50 border-[#69773D]" 
                        : "border-transparent"
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotification(notification.id);
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 transition-colors"
                      title="Delete notification"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </button>

                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 pr-6">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm text-gray-900">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-[#69773D] rounded-full ml-2 mt-1.5 animate-pulse"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <a
                href="/notifications"
                className="text-sm text-[#69773D] hover:text-[#84B067] font-medium transition-colors"
              >
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

