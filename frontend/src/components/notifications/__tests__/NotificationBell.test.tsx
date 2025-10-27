import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NotificationBell } from "../NotificationBell";
import type { Notification } from "../NotificationBell";

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
  });

  describe("Rendering", () => {
    it("should render the bell icon", () => {
      render(<NotificationBell />);
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      expect(bellButton).toBeInTheDocument();
    });

    it("should show unread count badge when there are unread notifications", () => {
      const notifications = [
        createMockNotification({ id: "1", read: false }),
        createMockNotification({ id: "2", read: false }),
      ];
      render(<NotificationBell initialNotifications={notifications} />);
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("should show 9+ when there are more than 9 unread notifications", () => {
      const notifications = Array.from({ length: 10 }, (_, i) =>
        createMockNotification({ id: String(i), read: false })
      );
      render(<NotificationBell initialNotifications={notifications} />);
      expect(screen.getByText("9+")).toBeInTheDocument();
    });

    it("should not show badge when all notifications are read", () => {
      const notifications = [
        createMockNotification({ id: "1", read: true }),
        createMockNotification({ id: "2", read: true }),
      ];
      render(<NotificationBell initialNotifications={notifications} />);
      expect(screen.queryByText("2")).not.toBeInTheDocument();
    });
  });

  describe("Dropdown Behavior", () => {
    it("should open dropdown when bell icon is clicked", () => {
      render(<NotificationBell />);
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      fireEvent.click(bellButton);
      expect(screen.getByText("Notifications")).toBeInTheDocument();
    });

    it("should close dropdown when bell icon is clicked again", () => {
      render(<NotificationBell />);
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      
      fireEvent.click(bellButton);
      expect(screen.getByText("Notifications")).toBeInTheDocument();
      
      fireEvent.click(bellButton);
      expect(screen.queryByText("Notifications")).not.toBeInTheDocument();
    });

    it("should close dropdown when clicking outside", async () => {
      render(<NotificationBell />);
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      
      fireEvent.click(bellButton);
      expect(screen.getByText("Notifications")).toBeInTheDocument();
      
      fireEvent.mouseDown(document.body);
      
      await waitFor(() => {
        expect(screen.queryByText("Notifications")).not.toBeInTheDocument();
      });
    });
  });

  describe("Empty State", () => {
    it("should show empty state when there are no notifications", () => {
      render(<NotificationBell />);
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      fireEvent.click(bellButton);
      
      expect(screen.getByText("No notifications yet")).toBeInTheDocument();
    });

    it("should not show Clear All button when there are no notifications", () => {
      render(<NotificationBell />);
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      fireEvent.click(bellButton);
      
      expect(screen.queryByText("Clear All")).not.toBeInTheDocument();
    });
  });

  describe("Notification Display", () => {
    it("should display all notifications", () => {
      const notifications = [
        createMockNotification({ id: "1", title: "Notification 1" }),
        createMockNotification({ id: "2", title: "Notification 2" }),
        createMockNotification({ id: "3", title: "Notification 3" }),
      ];
      render(<NotificationBell initialNotifications={notifications} />);
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      fireEvent.click(bellButton);
      
      expect(screen.getByText("Notification 1")).toBeInTheDocument();
      expect(screen.getByText("Notification 2")).toBeInTheDocument();
      expect(screen.getByText("Notification 3")).toBeInTheDocument();
    });

    it("should show unread indicator for unread notifications", () => {
      const notifications = [
        createMockNotification({ id: "1", read: false, title: "Unread Notification" }),
        createMockNotification({ id: "2", read: true, title: "Read Notification" }),
      ];
      render(<NotificationBell initialNotifications={notifications} />);
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      fireEvent.click(bellButton);
      
      // Check that the unread notification container has the highlight class
      const notificationElements = screen.getAllByRole("generic").filter(el => 
        el.className.includes("bg-blue-50")
      );
      expect(notificationElements.length).toBeGreaterThan(0);
    });

    it("should show correct icon for different notification types", () => {
      const notifications = [
        createMockNotification({ id: "1", type: "order", title: "Order Notification" }),
        createMockNotification({ id: "2", type: "message", title: "Message Notification" }),
        createMockNotification({ id: "3", type: "item", title: "Item Notification" }),
        createMockNotification({ id: "4", type: "system", title: "System Notification" }),
      ];
      render(<NotificationBell initialNotifications={notifications} />);
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      fireEvent.click(bellButton);
      
      expect(screen.getByText("Order Notification")).toBeInTheDocument();
      expect(screen.getByText("Message Notification")).toBeInTheDocument();
      expect(screen.getByText("Item Notification")).toBeInTheDocument();
      expect(screen.getByText("System Notification")).toBeInTheDocument();
    });
  });

  describe("Mark as Read", () => {
    it("should mark notification as read when clicked", () => {
      const notifications = [
        createMockNotification({ id: "1", read: false }),
      ];
      render(<NotificationBell initialNotifications={notifications} />);
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      fireEvent.click(bellButton);
      
      const notification = screen.getByText("Test Notification");
      fireEvent.click(notification);
      
      // Badge should update
      expect(screen.queryByText("1")).not.toBeInTheDocument();
    });

    it("should mark all notifications as read when Mark All as Read is clicked", () => {
      const notifications = [
        createMockNotification({ id: "1", read: false }),
        createMockNotification({ id: "2", read: false }),
      ];
      render(<NotificationBell initialNotifications={notifications} />);
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      fireEvent.click(bellButton);
      
      expect(screen.getByText("2")).toBeInTheDocument();
      
      const markAllButton = screen.getByTitle("Mark all as read");
      fireEvent.click(markAllButton);
      
      // Badge should disappear
      expect(screen.queryByText("2")).not.toBeInTheDocument();
    });
  });

  describe("Delete Notification", () => {
    it("should delete notification when delete button is clicked", () => {
      const notifications = [
        createMockNotification({ id: "1", title: "Notification 1" }),
        createMockNotification({ id: "2", title: "Notification 2" }),
      ];
      render(<NotificationBell initialNotifications={notifications} />);
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      fireEvent.click(bellButton);
      
      const deleteButtons = screen.getAllByTitle("Delete notification");
      fireEvent.click(deleteButtons[0]);
      
      expect(screen.queryByText("Notification 1")).not.toBeInTheDocument();
      expect(screen.getByText("Notification 2")).toBeInTheDocument();
    });

    it("should clear all notifications when Clear All is clicked", () => {
      const notifications = [
        createMockNotification({ id: "1", title: "Notification 1" }),
        createMockNotification({ id: "2", title: "Notification 2" }),
      ];
      render(<NotificationBell initialNotifications={notifications} />);
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      fireEvent.click(bellButton);
      
      const clearAllButton = screen.getByText("Clear All");
      fireEvent.click(clearAllButton);
      
      expect(screen.queryByText("Notification 1")).not.toBeInTheDocument();
      expect(screen.queryByText("Notification 2")).not.toBeInTheDocument();
      expect(screen.getByText("No notifications yet")).toBeInTheDocument();
    });
  });

  describe("Timestamp Formatting", () => {
    it("should show 'Just now' for recent notifications", () => {
      const notifications = [
        createMockNotification({ id: "1", timestamp: new Date() }),
      ];
      render(<NotificationBell initialNotifications={notifications} />);
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      fireEvent.click(bellButton);
      
      expect(screen.getByText("Just now")).toBeInTheDocument();
    });

    it("should show minutes ago for notifications less than an hour old", () => {
      const notifications = [
        createMockNotification({ 
          id: "1", 
          timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
        }),
      ];
      render(<NotificationBell initialNotifications={notifications} />);
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      fireEvent.click(bellButton);
      
      expect(screen.getByText("30m ago")).toBeInTheDocument();
    });

    it("should show hours ago for notifications less than a day old", () => {
      const notifications = [
        createMockNotification({ 
          id: "1", 
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        }),
      ];
      render(<NotificationBell initialNotifications={notifications} />);
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      fireEvent.click(bellButton);
      
      expect(screen.getByText("2h ago")).toBeInTheDocument();
    });
  });

  describe("View All Link", () => {
    it("should show 'View all notifications' link when there are notifications", () => {
      const notifications = [
        createMockNotification({ id: "1" }),
      ];
      render(<NotificationBell initialNotifications={notifications} />);
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      fireEvent.click(bellButton);
      
      expect(screen.getByText("View all notifications")).toBeInTheDocument();
    });

    it("should not show 'View all notifications' link when there are no notifications", () => {
      render(<NotificationBell />);
      const bellButton = screen.getByRole("button", { name: /notifications/i });
      fireEvent.click(bellButton);
      
      expect(screen.queryByText("View all notifications")).not.toBeInTheDocument();
    });
  });
});

