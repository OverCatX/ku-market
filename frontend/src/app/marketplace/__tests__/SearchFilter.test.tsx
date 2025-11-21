import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MarketPage from "../page";
import { listItems } from "@/config/items";
import type { MockListItems } from "@/test/types//test-types";
import { createMockItem, createMockResponse } from "@/test/types//test-types";

// Mock Next.js router hooks
const mockPush = jest.fn();
let mockSearchParams = new URLSearchParams();
const mockReplace = jest.fn((url: string) => {
  // Update mockSearchParams when router.replace is called
  const urlObj = new URL(url, "http://localhost");
  const newParams = new URLSearchParams(urlObj.search);
  // Create a new instance to trigger React re-render
  mockSearchParams = new URLSearchParams(newParams);
});

const mockRouter = {
  push: mockPush,
  replace: mockReplace,
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};

const mockPathname = "/marketplace";

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
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
  return function Pagination({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) {
    return (
      <div data-testid="pagination">
        <button
          data-testid="first-page"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          First
        </button>
        <button
          data-testid="prev-page"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span data-testid="page-info">
          Page {currentPage} of {totalPages}
        </span>
        <button
          data-testid="next-page"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
        <button
          data-testid="last-page"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          Last
        </button>
      </div>
    );
  };
});

const mockListItems = listItems as MockListItems;

// Mock window.scrollTo
Object.defineProperty(window, "scrollTo", {
  value: jest.fn(),
  writable: true,
});

// Helper function to wait for categories to load
const waitForCategories = async () => {
  await waitFor(() => {
    const categorySelect = screen.getAllByRole("combobox")[1];
    const electronicsOption = Array.from(categorySelect.querySelectorAll("option")).find(
      (opt) => opt.getAttribute("value") === "electronics"
    );
    expect(electronicsOption).toBeInTheDocument();
  }, { timeout: 3000 });
};

describe("MarketPage Tests", () => {
  const mockItems = [createMockItem({ title: "iPhone 13" })];

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    mockReplace.mockClear();
    // Reset search params
    mockSearchParams = new URLSearchParams();
    jest.useFakeTimers();
    mockListItems.mockResolvedValue(createMockResponse(mockItems));
  });

  afterEach(() => {
    try {
      jest.runOnlyPendingTimers();
    } catch (e) {
      // Ignore if no fake timers are active
    }
    jest.useRealTimers();
  });

  /** ----------------- Catalog / Loading ----------------- */
  describe("Catalog & Loading Skeleton", () => {
    it("should show skeleton on initial render", () => {
      mockListItems.mockImplementation(() => new Promise(() => {}));
      render(<MarketPage />);
      expect(
        document.querySelectorAll(".animate-pulse").length
      ).toBeGreaterThan(0);
    });

    it("should show 12 skeleton cards by default", () => {
      mockListItems.mockImplementation(() => new Promise(() => {}));
      render(<MarketPage />);
      const skeletonCards = document.querySelectorAll(
        ".bg-white.border.border-gray-200.rounded-xl.overflow-hidden.shadow-sm"
      );
      expect(skeletonCards.length).toBe(12);
    });

    it("should hide skeleton after items loaded", async () => {
      mockListItems.mockResolvedValue(createMockResponse(mockItems));
      render(<MarketPage />);
      expect(
        document.querySelectorAll(".animate-pulse").length
      ).toBeGreaterThan(0);

      await waitFor(() => {
        expect(screen.getByText("iPhone 13")).toBeInTheDocument();
      });

      expect(document.querySelectorAll(".animate-pulse").length).toBe(0);
    });

    it("should show empty state when no items", async () => {
      mockListItems.mockResolvedValue(createMockResponse([]));
      render(<MarketPage />);
      await waitFor(() => {
        expect(screen.getByText("No items found")).toBeInTheDocument();
      });
    });

    it("should show error message when loading fails", async () => {
      mockListItems.mockRejectedValue(new Error("Network error"));
      render(<MarketPage />);
      await waitFor(() => {
        expect(screen.getByText(/Failed to load items/i)).toBeInTheDocument();
      });
    });
  });

  /** ----------------- Pagination ----------------- */
  describe("Pagination", () => {
    it("should display pagination when items exist", async () => {
      mockListItems.mockResolvedValue(
        createMockResponse(mockItems, { totalPages: 3, totalItems: 30 })
      );
      render(<MarketPage />);
      await waitFor(() =>
        expect(screen.getByTestId("pagination")).toBeInTheDocument()
      );
    });


    it("should not show pagination on empty results", async () => {
      mockListItems.mockResolvedValue(createMockResponse([]));
      render(<MarketPage />);
      await waitFor(() =>
        expect(screen.getByText("No items found")).toBeInTheDocument()
      );
      expect(screen.queryByTestId("pagination")).not.toBeInTheDocument();
    });
  });

  /** ----------------- Search / Filter / Sort ----------------- */
  describe("Search, Filter & Sort", () => {
    it("should debounce search input", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MarketPage />);
      const searchInput = screen.getByPlaceholderText("Search items...");
      await user.type(searchInput, "Mac");
      expect(mockListItems).toHaveBeenCalledTimes(1); // initial load
      act(() => {
        jest.advanceTimersByTime(500);
      });
      await waitFor(() => {
        expect(mockListItems).toHaveBeenCalledWith(
          expect.objectContaining({ search: "Mac", page: 1 }),
          expect.any(AbortSignal)
        );
      });
    });

  });
});
