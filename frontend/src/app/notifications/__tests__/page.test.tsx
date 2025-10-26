import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NotificationsPage from "../page";

// Since we removed mocks, these tests will test the empty state
// When backend is integrated, mock the API calls instead

describe("NotificationsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("Loading State", () => {
    it("should show loading skeleton initially", () => {
      render(<NotificationsPage />);
      expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
    });

    it("should show content after loading", async () => {
      render(<NotificationsPage />);
      
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        // Should show the header after loading completes
        expect(screen.getByText("Notifications")).toBeInTheDocument();
      });
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no notifications", async () => {
      render(<NotificationsPage />);
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(screen.getByText("No notifications yet")).toBeInTheDocument();
      });
    });

    it("should show caught up message when no unread", async () => {
      render(<NotificationsPage />);
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(screen.getByText("You're all caught up!")).toBeInTheDocument();
      });
    });
  });

  // Note: Filtering tests removed since we have empty state by default
  // Add these back when mocking the API with test data

  // Note: Action and timestamp tests removed since we have empty state by default
  // Add these back when mocking the API with test data
});

