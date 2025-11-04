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

describe("MarketPage Tests", () => {
  const mockItems = [createMockItem({ title: "iPhone 13" })];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockListItems.mockResolvedValue(createMockResponse(mockItems));
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
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

    it("should navigate to next page", async () => {
      mockListItems.mockResolvedValueOnce(
        createMockResponse(mockItems, {
          currentPage: 1,
          totalPages: 3,
          totalItems: 30,
        })
      );
      render(<MarketPage />);
      await waitFor(() =>
        expect(screen.getByTestId("next-page")).toBeInTheDocument()
      );

      mockListItems.mockResolvedValueOnce(
        createMockResponse(mockItems, {
          currentPage: 2,
          totalPages: 3,
          totalItems: 30,
        })
      );
      fireEvent.click(screen.getByTestId("next-page"));

      await waitFor(() => {
        expect(mockListItems).toHaveBeenCalledWith(
          expect.objectContaining({ page: 2 }),
          expect.any(AbortSignal)
        );
      });
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

    it("should filter by status", async () => {
      jest.useRealTimers();
      const user = userEvent.setup();
      render(<MarketPage />);
      const statusSelect = screen.getAllByRole("combobox")[0];
      await user.selectOptions(statusSelect, "available");
      await waitFor(() =>
        expect(mockListItems).toHaveBeenCalledWith(
          expect.objectContaining({ status: "available" }),
          expect.any(AbortSignal)
        )
      );
      jest.useFakeTimers();
    });

    it("should filter by category", async () => {
      jest.useRealTimers();
      const user = userEvent.setup();
      render(<MarketPage />);
      
      // Wait for categories to load and appear in the select dropdown
      await waitFor(() => {
        const categorySelect = screen.getAllByRole("combobox")[1];
        const electronicsOption = Array.from(categorySelect.querySelectorAll("option")).find(
          (opt) => opt.getAttribute("value") === "electronics"
        );
        expect(electronicsOption).toBeInTheDocument();
      });
      
      const categorySelect = screen.getAllByRole("combobox")[1];
      await user.selectOptions(categorySelect, "electronics");
      await waitFor(() =>
        expect(mockListItems).toHaveBeenCalledWith(
          expect.objectContaining({ category: "electronics" }),
          expect.any(AbortSignal)
        )
      );
      jest.useFakeTimers();
    });

    it("should sort by price ascending and toggle order", async () => {
      jest.useRealTimers();
      const user = userEvent.setup();
      render(<MarketPage />);
      const sortSelect = screen.getAllByRole("combobox")[2];
      await user.selectOptions(sortSelect, "price");

      const sortToggle = screen.queryByLabelText(/Sort ascending/i);
      if (sortToggle) await user.click(sortToggle);

      await waitFor(() =>
        expect(mockListItems).toHaveBeenCalledWith(
          expect.objectContaining({ sortBy: "price" }),
          expect.any(AbortSignal)
        )
      );
      jest.useFakeTimers();
    });

    it("should apply combined filters", async () => {
      const user = userEvent.setup({ delay: null });
      render(<MarketPage />);
      const searchInput = screen.getByPlaceholderText("Search items...");
      const statusSelect = screen.getAllByRole("combobox")[0];
      const categorySelect = screen.getAllByRole("combobox")[1];

      await user.type(searchInput, "phone");
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await user.selectOptions(statusSelect, "available");
      await user.selectOptions(categorySelect, "electronics");

      await waitFor(() =>
        expect(mockListItems).toHaveBeenCalledWith(
          expect.objectContaining({
            search: "phone",
            status: "available",
            category: "electronics",
            page: 1,
          }),
          expect.any(AbortSignal)
        )
      );
    });
  });
});
