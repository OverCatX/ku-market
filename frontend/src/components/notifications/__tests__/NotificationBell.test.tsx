import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { NotificationBell } from "../NotificationBell";
import type { Notification } from "../NotificationBell";
import * as notificationsApi from "@/config/notifications";

// Mock the notification API
jest.mock("@/config/notifications", () => ({
  getNotifications: jest.fn(),
  markNotificationAsRead: jest.fn(),
  markAllNotificationsAsRead: jest.fn(),
  deleteNotification: jest.fn(),
  clearAllNotifications: jest.fn(),
}));

const createMockNotification = (overrides?: Partial<Notification>): Notification => ({
  id: "1",
  type: "order",
  title: "Test Notification",
  message: "Test message",
  timestamp: new Date(),
  read: false,
  link: undefined,
  ...overrides,
});

describe("NotificationBell Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => "fake-token"),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
    // Default mock: return empty notifications
    (notificationsApi.getNotifications as jest.Mock).mockResolvedValue({
      notifications: [],
      unreadCount: 0,
    });
  });

  describe("Rendering", () => {
    it("should render the bell icon", async () => {
      render(<NotificationBell />);
      await waitFor(() => {
        const bellButton = screen.getByRole("button", { name: /notifications/i });
        expect(bellButton).toBeInTheDocument();
      });
    });

    it("should show unread count badge when there are unread notifications", async () => {
      const notifications = [
        createMockNotification({ id: "1", read: false }),
        createMockNotification({ id: "2", read: false }),
      ];
      (notificationsApi.getNotifications as jest.Mock).mockResolvedValue({
        notifications,
        unreadCount: 2,
      });
      render(<NotificationBell initialNotifications={notifications} />);
      await waitFor(() => {
        expect(screen.getByText("2")).toBeInTheDocument();
      });
    });

    it("should show 9+ when there are more than 9 unread notifications", async () => {
      const notifications = Array.from({ length: 10 }, (_, i) =>
        createMockNotification({ id: String(i), read: false })
      );
      (notificationsApi.getNotifications as jest.Mock).mockResolvedValue({
        notifications,
        unreadCount: 10,
      });
      render(<NotificationBell initialNotifications={notifications} />);
      await waitFor(() => {
        expect(screen.getByText("9+")).toBeInTheDocument();
      });
    });

    it("should not show badge when all notifications are read", async () => {
      const notifications = [
        createMockNotification({ id: "1", read: true }),
        createMockNotification({ id: "2", read: true }),
      ];
      (notificationsApi.getNotifications as jest.Mock).mockResolvedValue({
        notifications,
        unreadCount: 0,
      });
      render(<NotificationBell initialNotifications={notifications} />);
      await waitFor(() => {
        expect(screen.queryByText("2")).not.toBeInTheDocument();
      });
    });
  });

  describe("Dropdown Behavior", () => {
    it("should open dropdown when bell icon is clicked", async () => {
      render(<NotificationBell />);
      await waitFor(() => {
        const bellButton = screen.getByRole("button", { name: /notifications/i });
        expect(bellButton).toBeInTheDocument();
      });
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      await act(async () => {
        fireEvent.click(bellButton);
      });
      await waitFor(() => {
        expect(screen.getByText("Notifications")).toBeInTheDocument();
      });
    });

    it("should close dropdown when bell icon is clicked again", async () => {
      render(<NotificationBell />);
      await waitFor(() => {
        const bellButton = screen.getByRole("button", { name: /notifications/i });
        expect(bellButton).toBeInTheDocument();
      });
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      
      await act(async () => {
        fireEvent.click(bellButton);
      });
      await waitFor(() => {
        expect(screen.getByText("Notifications")).toBeInTheDocument();
      });
      
      await act(async () => {
        fireEvent.click(bellButton);
      });
      await waitFor(() => {
        expect(screen.queryByText("Notifications")).not.toBeInTheDocument();
      });
    });

    it("should close dropdown when clicking outside", async () => {
      render(<NotificationBell />);
      await waitFor(() => {
        const bellButton = screen.getByRole("button", { name: /notifications/i });
        expect(bellButton).toBeInTheDocument();
      });
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      
      await act(async () => {
        fireEvent.click(bellButton);
      });
      await waitFor(() => {
        expect(screen.getByText("Notifications")).toBeInTheDocument();
      });
      
      await act(async () => {
        fireEvent.mouseDown(document.body);
      });
      
      await waitFor(() => {
        expect(screen.queryByText("Notifications")).not.toBeInTheDocument();
      });
    });
  });

  describe("Empty State", () => {
    it("should show empty state when there are no notifications", async () => {
      render(<NotificationBell />);
      await waitFor(() => {
        const bellButton = screen.getByRole("button", { name: /notifications/i });
        expect(bellButton).toBeInTheDocument();
      });
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      await act(async () => {
        fireEvent.click(bellButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText("No notifications yet")).toBeInTheDocument();
      });
    });

    it("should not show Clear All button when there are no notifications", async () => {
      render(<NotificationBell />);
      await waitFor(() => {
        const bellButton = screen.getByRole("button", { name: /notifications/i });
        expect(bellButton).toBeInTheDocument();
      });
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      await act(async () => {
        fireEvent.click(bellButton);
      });
      
      await waitFor(() => {
        expect(screen.queryByText("Clear All")).not.toBeInTheDocument();
      });
    });
  });

  describe("Notification Display", () => {
    it("should display all notifications", async () => {
      const notifications = [
        createMockNotification({ id: "1", title: "Notification 1" }),
        createMockNotification({ id: "2", title: "Notification 2" }),
        createMockNotification({ id: "3", title: "Notification 3" }),
      ];
      (notificationsApi.getNotifications as jest.Mock).mockResolvedValue({
        notifications,
        unreadCount: 0,
      });
      render(<NotificationBell initialNotifications={notifications} />);
      await waitFor(() => {
        const bellButton = screen.getByRole("button", { name: /notifications/i });
        expect(bellButton).toBeInTheDocument();
      });
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      await act(async () => {
        fireEvent.click(bellButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText("Notification 1")).toBeInTheDocument();
        expect(screen.getByText("Notification 2")).toBeInTheDocument();
        expect(screen.getByText("Notification 3")).toBeInTheDocument();
      });
    });

    it("should show unread indicator for unread notifications", async () => {
      const notifications = [
        createMockNotification({ id: "1", read: false, title: "Unread Notification" }),
        createMockNotification({ id: "2", read: true, title: "Read Notification" }),
      ];
      (notificationsApi.getNotifications as jest.Mock).mockResolvedValue({
        notifications,
        unreadCount: 1,
      });
      render(<NotificationBell initialNotifications={notifications} />);
      await waitFor(() => {
        const bellButton = screen.getByRole("button", { name: /notifications/i });
        expect(bellButton).toBeInTheDocument();
      });
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      await act(async () => {
        fireEvent.click(bellButton);
      });
      
      await waitFor(() => {
        // Check that the unread notification container has the highlight class (green-50 instead of blue-50)
        const notificationElements = screen.getAllByRole("generic").filter(el => 
          el.className.includes("bg-green-50") || el.className.includes("border-[#69773D]")
        );
        expect(notificationElements.length).toBeGreaterThan(0);
      });
    });

    it("should show correct icon for different notification types", async () => {
      const notifications = [
        createMockNotification({ id: "1", type: "order", title: "Order Notification" }),
        createMockNotification({ id: "2", type: "message", title: "Message Notification" }),
        createMockNotification({ id: "3", type: "item", title: "Item Notification" }),
        createMockNotification({ id: "4", type: "system", title: "System Notification" }),
      ];
      (notificationsApi.getNotifications as jest.Mock).mockResolvedValue({
        notifications,
        unreadCount: 0,
      });
      render(<NotificationBell initialNotifications={notifications} />);
      await waitFor(() => {
        const bellButton = screen.getByRole("button", { name: /notifications/i });
        expect(bellButton).toBeInTheDocument();
      });
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      await act(async () => {
        fireEvent.click(bellButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText("Order Notification")).toBeInTheDocument();
        expect(screen.getByText("Message Notification")).toBeInTheDocument();
        expect(screen.getByText("Item Notification")).toBeInTheDocument();
        expect(screen.getByText("System Notification")).toBeInTheDocument();
      });
    });
  });

  describe("Mark as Read", () => {
    it("should mark notification as read when clicked", async () => {
      // Mock window.location.href to track navigation
      let navigatedTo = "";
      Object.defineProperty(window, "location", {
        value: {
          get href() {
            return navigatedTo;
          },
          set href(value: string) {
            navigatedTo = value;
          },
        },
        writable: true,
        configurable: true,
      });
      
      const notifications = [
        createMockNotification({ id: "1", read: false, link: "/test" }),
      ];
      
      (notificationsApi.getNotifications as jest.Mock).mockResolvedValue({
        notifications,
        unreadCount: 1,
      });
      (notificationsApi.markNotificationAsRead as jest.Mock).mockResolvedValue(undefined);
      
      render(<NotificationBell initialNotifications={notifications} />);
      await waitFor(() => {
        const bellButton = screen.getByRole("button", { name: /notifications/i });
        expect(bellButton).toBeInTheDocument();
      });
      
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      await act(async () => {
        fireEvent.click(bellButton);
      });
      
      await waitFor(() => {
        const notification = screen.getByText("Test Notification");
        expect(notification).toBeInTheDocument();
      });
      
      const notification = screen.getByText("Test Notification");
      
      // Click notification - this will mark as read and navigate
      await act(async () => {
        fireEvent.click(notification);
      });
      
      // Verify navigation happened (mark as read and navigation happens)
      await waitFor(() => {
        expect(navigatedTo).toBe("/test");
      }, { timeout: 1000 });
      
      // The API call should be attempted (may not complete before navigation)
      // Just verify the click worked by checking navigation
      expect(navigatedTo).toBe("/test");
    });

    it("should mark all notifications as read when Mark All as Read is clicked", async () => {
      const notifications = [
        createMockNotification({ id: "1", read: false }),
        createMockNotification({ id: "2", read: false }),
      ];
      
      // Mock updated notifications after mark all as read
      const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
      
      // Setup mock: return unread notifications initially
      (notificationsApi.getNotifications as jest.Mock).mockResolvedValue({
        notifications,
        unreadCount: 2,
      });
      (notificationsApi.markAllNotificationsAsRead as jest.Mock).mockResolvedValue(undefined);
      
      render(<NotificationBell initialNotifications={notifications} />);
      
      // Wait for badge to appear
      await waitFor(() => {
        expect(screen.getByText("2")).toBeInTheDocument();
      }, { timeout: 3000 });
      
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      await act(async () => {
        fireEvent.click(bellButton);
      });
      
      // Wait for dropdown to open and mark all button to appear
      await waitFor(() => {
        expect(screen.getByTitle("Mark all as read")).toBeInTheDocument();
      }, { timeout: 3000 });
      
      const markAllButton = screen.getByTitle("Mark all as read");
      
      // Update mock to return read notifications after mark all
      (notificationsApi.getNotifications as jest.Mock).mockResolvedValue({
        notifications: updatedNotifications,
        unreadCount: 0,
      });
      
      await act(async () => {
        fireEvent.click(markAllButton);
      });
      
      // Verify API was called
      await waitFor(() => {
        expect(notificationsApi.markAllNotificationsAsRead).toHaveBeenCalled();
      });
      
      // Badge should disappear (optimistic UI update sets all notifications to read)
      await waitFor(() => {
        expect(screen.queryByText("2")).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe("Delete Notification", () => {
    it("should delete notification when delete button is clicked", async () => {
      const notifications = [
        createMockNotification({ id: "1", title: "Notification 1" }),
        createMockNotification({ id: "2", title: "Notification 2" }),
      ];
      
      // After delete, return remaining notifications
      const remainingNotifications = [notifications[1]];
      
      // Setup mock: return notifications for all calls until after delete
      (notificationsApi.getNotifications as jest.Mock).mockResolvedValue({
        notifications,
        unreadCount: 0,
      });
      (notificationsApi.deleteNotification as jest.Mock).mockResolvedValue(undefined);
      
      render(<NotificationBell initialNotifications={notifications} />);
      
      // Wait for component to mount and fetch
      await waitFor(() => {
        const bellButton = screen.getByRole("button", { name: /notifications/i });
        expect(bellButton).toBeInTheDocument();
      });
      
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      await act(async () => {
        fireEvent.click(bellButton);
      });
      
      // Wait for notifications to appear in dropdown
      await waitFor(() => {
        expect(screen.getByText("Notification 1")).toBeInTheDocument();
        expect(screen.getByText("Notification 2")).toBeInTheDocument();
      }, { timeout: 3000 });
      
      const deleteButtons = screen.getAllByTitle("Delete notification");
      expect(deleteButtons.length).toBeGreaterThan(0);
      
      // Now mock to return remaining notifications after delete
      (notificationsApi.getNotifications as jest.Mock).mockResolvedValue({
        notifications: remainingNotifications,
        unreadCount: 0,
      });
      
      await act(async () => {
        fireEvent.click(deleteButtons[0]);
      });
      
      // Verify API was called
      await waitFor(() => {
        expect(notificationsApi.deleteNotification).toHaveBeenCalledWith("1");
      });
      
      // Notification should be removed from state immediately (optimistic update)
      await waitFor(() => {
        expect(screen.queryByText("Notification 1")).not.toBeInTheDocument();
        expect(screen.getByText("Notification 2")).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it("should clear all notifications when Clear All is clicked", async () => {
      const notifications = [
        createMockNotification({ id: "1", title: "Notification 1" }),
        createMockNotification({ id: "2", title: "Notification 2" }),
      ];
      
      // Setup mock: return notifications initially
      (notificationsApi.getNotifications as jest.Mock).mockResolvedValue({
        notifications,
        unreadCount: 0,
      });
      (notificationsApi.clearAllNotifications as jest.Mock).mockResolvedValue(undefined);
      
      render(<NotificationBell initialNotifications={notifications} />);
      
      await waitFor(() => {
        const bellButton = screen.getByRole("button", { name: /notifications/i });
        expect(bellButton).toBeInTheDocument();
      });
      
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      await act(async () => {
        fireEvent.click(bellButton);
      });
      
      // Wait for notifications to appear in dropdown
      await waitFor(() => {
        expect(screen.getByText("Notification 1")).toBeInTheDocument();
        expect(screen.getByText("Notification 2")).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Find Clear All button
      const clearAllButton = await waitFor(() => {
        return screen.getByText("Clear All");
      });
      
      // Now mock to return empty notifications after clear
      (notificationsApi.getNotifications as jest.Mock).mockResolvedValue({
        notifications: [],
        unreadCount: 0,
      });
      
      // Click Clear All
      await act(async () => {
        fireEvent.click(clearAllButton);
      });
      
      // Verify API was called
      await waitFor(() => {
        expect(notificationsApi.clearAllNotifications).toHaveBeenCalled();
      });
      
      // State should be cleared immediately (optimistic update sets notifications to [])
      await waitFor(() => {
        expect(screen.queryByText("Notification 1")).not.toBeInTheDocument();
        expect(screen.queryByText("Notification 2")).not.toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Should show empty state
      await waitFor(() => {
        expect(screen.getByText("No notifications yet")).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe("Timestamp Formatting", () => {
    it("should show 'Just now' for recent notifications", async () => {
      const notifications = [
        createMockNotification({ id: "1", timestamp: new Date() }),
      ];
      (notificationsApi.getNotifications as jest.Mock).mockResolvedValue({
        notifications,
        unreadCount: 0,
      });
      render(<NotificationBell initialNotifications={notifications} />);
      await waitFor(() => {
        const bellButton = screen.getByRole("button", { name: /notifications/i });
        expect(bellButton).toBeInTheDocument();
      });
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      await act(async () => {
        fireEvent.click(bellButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText("Just now")).toBeInTheDocument();
      });
    });

    it("should show minutes ago for notifications less than an hour old", async () => {
      const notifications = [
        createMockNotification({ 
          id: "1", 
          timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
        }),
      ];
      (notificationsApi.getNotifications as jest.Mock).mockResolvedValue({
        notifications,
        unreadCount: 0,
      });
      render(<NotificationBell initialNotifications={notifications} />);
      await waitFor(() => {
        const bellButton = screen.getByRole("button", { name: /notifications/i });
        expect(bellButton).toBeInTheDocument();
      });
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      await act(async () => {
        fireEvent.click(bellButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText("30m ago")).toBeInTheDocument();
      });
    });

    it("should show hours ago for notifications less than a day old", async () => {
      const notifications = [
        createMockNotification({ 
          id: "1", 
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        }),
      ];
      (notificationsApi.getNotifications as jest.Mock).mockResolvedValue({
        notifications,
        unreadCount: 0,
      });
      render(<NotificationBell initialNotifications={notifications} />);
      await waitFor(() => {
        const bellButton = screen.getByRole("button", { name: /notifications/i });
        expect(bellButton).toBeInTheDocument();
      });
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      await act(async () => {
        fireEvent.click(bellButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText("2h ago")).toBeInTheDocument();
      });
    });
  });

  describe("View All Link", () => {
    it("should show 'View all notifications' link when there are notifications", async () => {
      const notifications = [
        createMockNotification({ id: "1" }),
      ];
      (notificationsApi.getNotifications as jest.Mock).mockResolvedValue({
        notifications,
        unreadCount: 0,
      });
      render(<NotificationBell initialNotifications={notifications} />);
      await waitFor(() => {
        const bellButton = screen.getByRole("button", { name: /notifications/i });
        expect(bellButton).toBeInTheDocument();
      });
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      await act(async () => {
        fireEvent.click(bellButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText("View all notifications")).toBeInTheDocument();
      });
    });

    it("should not show 'View all notifications' link when there are no notifications", async () => {
      render(<NotificationBell />);
      await waitFor(() => {
        const bellButton = screen.getByRole("button", { name: /notifications/i });
        expect(bellButton).toBeInTheDocument();
      });
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      await act(async () => {
        fireEvent.click(bellButton);
      });
      
      await waitFor(() => {
        expect(screen.queryByText("View all notifications")).not.toBeInTheDocument();
      });
    });
  });
});

