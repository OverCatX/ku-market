import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MarketPage from "./page";
import { listItems } from "@/config/items";
import type { MockListItems } from "@/test/types/test-types";
import { createMockItem, createMockResponse } from "@/test/types/test-types";

jest.mock("@/config/items");

jest.mock("@/components/Marketplace/ItemCard", () => {
  return function ItemCard({
    title,
    price,
    status,
  }: {
    title: string;
    price: number;
    status: string;
  }) {
    return (
      <div data-testid="item-card">
        <h3>{title}</h3>
        <p>฿{price}</p>
        <span>{status}</span>
      </div>
    );
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
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span data-testid="page-info">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
  };
});

const mockListItems = listItems as MockListItems;

describe("MarketPage - Integration Tests", () => {
  const mockItems = [
    createMockItem({
      _id: "1",
      title: "iPhone 13",
      price: 25000,
      category: "electronics",
    }),
    createMockItem({
      _id: "2",
      title: "T-Shirt",
      price: 500,
      category: "clothing",
    }),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockListItems.mockResolvedValue(createMockResponse(mockItems));
  });

  describe("Page Rendering", () => {
    it("should render marketplace page with all main sections", async () => {
      render(<MarketPage />);

      expect(screen.getByText("Marketplace")).toBeInTheDocument();
      expect(screen.getByText(/browse/i)).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Search items...")
      ).toBeInTheDocument();
      expect(screen.getByText("All Status")).toBeInTheDocument();
      expect(screen.getByText("All Categories")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText("iPhone 13")).toBeInTheDocument();
      });
    });

    it("should display items after loading", async () => {
      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByText("iPhone 13")).toBeInTheDocument();
        expect(screen.getByText("T-Shirt")).toBeInTheDocument();
      });
    });
  });

  describe("Search and Filter Integration", () => {
    it("should search and filter by category together", async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });

      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByText("iPhone 13")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText("Search items...");
      await user.type(searchInput, "iPhone");

      jest.advanceTimersByTime(500);

      const categorySelect = screen.getAllByRole("combobox")[1];
      await user.selectOptions(categorySelect, "electronics");

      await waitFor(() => {
        expect(mockListItems).toHaveBeenCalledWith(
          expect.objectContaining({
            search: "iPhone",
            category: "electronics",
            page: 1,
          }),
          expect.any(AbortSignal)
        );
      });

      jest.useRealTimers();
    });

    it("should filter by status and sort by price", async () => {
      const user = userEvent.setup();
      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByText("iPhone 13")).toBeInTheDocument();
      });

      const statusSelect = screen.getAllByRole("combobox")[0];
      await user.selectOptions(statusSelect, "available");

      const sortSelect = screen.getAllByRole("combobox")[2];
      await user.selectOptions(sortSelect, "price");

      await waitFor(() => {
        expect(mockListItems).toHaveBeenCalledWith(
          expect.objectContaining({
            status: "available",
            sortBy: "price",
            sortOrder: "asc",
          }),
          expect.any(AbortSignal)
        );
      });
    });

    it("should reset to page 1 when applying filters", async () => {
      mockListItems.mockResolvedValueOnce(
        createMockResponse(mockItems, { currentPage: 2, totalPages: 3 })
      );

      const user = userEvent.setup();
      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByTestId("page-info")).toHaveTextContent(
          "Page 2 of 3"
        );
      });

      const statusSelect = screen.getAllByRole("combobox")[0];
      await user.selectOptions(statusSelect, "sold");

      await waitFor(() => {
        expect(mockListItems).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 1,
          }),
          expect.any(AbortSignal)
        );
      });
    });
  });

  describe("Error Handling", () => {
    it("should display error and allow retry", async () => {
      mockListItems.mockRejectedValueOnce(new Error("Network error"));

      render(<MarketPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/Failed to load items. Please try again./i)
        ).toBeInTheDocument();
      });

      expect(screen.getByText("Retry")).toBeInTheDocument();
    });

    it("should retry fetching on retry button click", async () => {
      mockListItems.mockRejectedValueOnce(new Error("Network error"));

      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByText("Retry")).toBeInTheDocument();
      });

      mockListItems.mockResolvedValueOnce(createMockResponse(mockItems));

      fireEvent.click(screen.getByText("Retry"));

      await waitFor(() => {
        expect(screen.getByText("iPhone 13")).toBeInTheDocument();
      });
    });
  });

  describe("Pagination Integration", () => {
    it("should navigate between pages", async () => {
      mockListItems.mockResolvedValueOnce(
        createMockResponse(mockItems, {
          currentPage: 1,
          totalPages: 3,
          totalItems: 30,
        })
      );

      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
      });

      mockListItems.mockResolvedValueOnce(
        createMockResponse(mockItems, {
          currentPage: 2,
          totalPages: 3,
          totalItems: 30,
        })
      );

      fireEvent.click(screen.getByText("Next"));

      await waitFor(() => {
        expect(mockListItems).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 2,
          }),
          expect.any(AbortSignal)
        );
      });
    });
  });

  describe("Complete User Journey", () => {
    it("should complete full shopping flow", async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });

      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByText("iPhone 13")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText("Search items...");
      await user.type(searchInput, "iPhone");
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(mockListItems).toHaveBeenCalledWith(
          expect.objectContaining({
            search: "iPhone",
          }),
          expect.any(AbortSignal)
        );
      });

      const categorySelect = screen.getAllByRole("combobox")[1];
      await user.selectOptions(categorySelect, "electronics");

      const sortSelect = screen.getAllByRole("combobox")[2];
      await user.selectOptions(sortSelect, "price");

      await waitFor(() => {
        expect(screen.getByLabelText(/Sort ascending/i)).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText(/Sort ascending/i));

      await waitFor(() => {
        expect(mockListItems).toHaveBeenLastCalledWith(
          expect.objectContaining({
            search: "iPhone",
            category: "electronics",
            sortBy: "price",
            sortOrder: "desc",
          }),
          expect.any(AbortSignal)
        );
      });

      jest.useRealTimers();
    });
  });
});
