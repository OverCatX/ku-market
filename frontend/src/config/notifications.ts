import { API_BASE } from "./constants";
import type { Notification } from "@/components/notifications";

export type NotificationsResponse = {
  notifications: Notification[];
  unreadCount: number;
};

export async function getNotifications(): Promise<NotificationsResponse> {
  try {
    const token = localStorage.getItem("authentication");
    const res = await fetch(`${API_BASE}/api/notifications`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!res.ok) throw new Error("Failed to fetch notifications");

    const data: NotificationsResponse = await res.json();
    
    // Convert timestamp strings to Date objects
    const notifications = data.notifications.map((n) => ({
      ...n,
      timestamp: new Date(n.timestamp),
    }));

    return {
      notifications,
      unreadCount: data.unreadCount,
    };
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("Something went wrong");
    }
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const token = localStorage.getItem("authentication");
    const res = await fetch(`${API_BASE}/api/notifications/${notificationId}/read`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!res.ok) throw new Error("Failed to mark notification as read");
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("Something went wrong");
    }
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    const token = localStorage.getItem("authentication");
    const res = await fetch(`${API_BASE}/api/notifications/read-all`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!res.ok) throw new Error("Failed to mark all notifications as read");
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("Something went wrong");
    }
  }
}

export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    const token = localStorage.getItem("authentication");
    const res = await fetch(`${API_BASE}/api/notifications/${notificationId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!res.ok) throw new Error("Failed to delete notification");
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("Something went wrong");
    }
  }
}

export async function clearAllNotifications(): Promise<void> {
  try {
    const token = localStorage.getItem("authentication");
    const res = await fetch(`${API_BASE}/api/notifications/clear-all`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!res.ok) throw new Error("Failed to clear all notifications");
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("Something went wrong");
    }
  }
}

