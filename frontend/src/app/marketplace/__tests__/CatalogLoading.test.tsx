import { render, screen, waitFor } from "@testing-library/react";
import MarketPage from "../page";
import { listItems } from "@/config/items";
import type { MockListItems } from "@/test/types//test-types";
import { createMockItem, createMockResponse } from "@/test/types//test-types";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
}));

jest.mock("@/config/items");
jest.mock("@/config/categories", () => ({
  getCategories: jest.fn().mockResolvedValue([
    { id: "1", name: "Electronics", slug: "electronics" },
    { id: "2", name: "Books", slug: "books" },
  ]),
}));
jest.mock("@/components/home/FooterSection", () => {
  return function FooterSection() {
    return <footer data-testid="footer">Footer</footer>;
  };
});
jest.mock("@/components/Marketplace/ItemCard", () => {
  return function ItemCard({ title }: { title: string }) {
    return <div data-testid="item-card">{title}</div>;
  };
});
jest.mock("@/components/Marketplace/Pagination", () => {
  return function Pagination() {
    return <div data-testid="pagination" />;
  };
});

const mockListItems = listItems as MockListItems;

describe("Catalog Loading Tests", () => {
  const mockItems = [createMockItem({ title: "iPhone 13" })];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers(); // สำหรับ debounce
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Initial Loading State", () => {
    it("should show loading skeleton on initial render", () => {
      mockListItems.mockImplementation(() => new Promise(() => {}));
      render(<MarketPage />);

      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("should display 12 skeleton cards by default", () => {
      mockListItems.mockImplementation(() => new Promise(() => {}));
      render(<MarketPage />);

      const skeletonCards = document.querySelectorAll(
        ".bg-white.border.border-gray-200.rounded-xl.overflow-hidden.shadow-sm"
      );
      expect(skeletonCards.length).toBe(12);
    });

    it("should not show item cards while loading", () => {
      mockListItems.mockImplementation(() => new Promise(() => {}));
      render(<MarketPage />);

      expect(screen.queryByTestId("item-card")).not.toBeInTheDocument();
    });
  });

  describe("Successful Data Loading", () => {
    it("should hide skeleton and show items after successful load", async () => {
      mockListItems.mockResolvedValue(createMockResponse(mockItems));

      render(<MarketPage />);

      expect(
        document.querySelectorAll(".animate-pulse").length
      ).toBeGreaterThan(0);

      await waitFor(() => {
        expect(screen.getByText("iPhone 13")).toBeInTheDocument();
      });

      const skeletonsAfter = document.querySelectorAll(".animate-pulse");
      expect(skeletonsAfter.length).toBe(0);
    });

    it("should show correct number of items", async () => {
      mockListItems.mockResolvedValue(
        createMockResponse([
          createMockItem({ _id: "1" }),
          createMockItem({ _id: "2" }),
        ])
      );

      render(<MarketPage />);

      await waitFor(() => {
        const itemCards = screen.getAllByTestId("item-card");
        expect(itemCards).toHaveLength(2);
      });
    });

    it("should call listItems with correct initial parameters", async () => {
      mockListItems.mockResolvedValue(createMockResponse(mockItems));

      render(<MarketPage />);

      await waitFor(() => {
        expect(mockListItems).toHaveBeenCalledWith(
          {
            page: 1,
            limit: 12,
            search: "",
            category: "",
            status: "",
            sortBy: undefined,
            sortOrder: "asc",
          },
          expect.any(AbortSignal)
        );
      });
    });
  });

  describe("Error Handling During Loading", () => {
    it("should show error message when loading fails", async () => {
      mockListItems.mockRejectedValue(new Error("Network error"));

      render(<MarketPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/Failed to load items. Please try again./i)
        ).toBeInTheDocument();
      });
    });

    it("should hide skeleton when error occurs", async () => {
      mockListItems.mockRejectedValue(new Error("Network error"));

      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load items/i)).toBeInTheDocument();
      });

      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBe(0);
    });
  });

  describe("Empty State Loading", () => {
    it("should show empty state when no items returned", async () => {
      mockListItems.mockResolvedValue(createMockResponse([]));

      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByText("No items found")).toBeInTheDocument();
      });
    });

    it("should hide skeleton when showing empty state", async () => {
      mockListItems.mockResolvedValue(createMockResponse([]));

      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByText("No items found")).toBeInTheDocument();
      });

      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBe(0);
    });
  });

  describe("Skeleton Animation", () => {
    it("should have gradient animation classes", () => {
      mockListItems.mockImplementation(() => new Promise(() => {}));
      render(<MarketPage />);

      const gradients = document.querySelectorAll(
        ".bg-gradient-to-r.from-gray-200.via-gray-100.to-gray-200"
      );
      expect(gradients.length).toBeGreaterThan(0);
    });

    it("should have pulse animation on skeleton elements", () => {
      mockListItems.mockImplementation(() => new Promise(() => {}));
      render(<MarketPage />);

      const pulseElements = document.querySelectorAll(".animate-pulse");
      expect(pulseElements.length).toBeGreaterThan(0);
    });
  });
});
