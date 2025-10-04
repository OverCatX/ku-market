import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MarketPage from "../page";
import { listItems } from "@/config/items";
import type { MockListItems } from "@/test/types//test-types";
import { createMockItem, createMockResponse } from "@/test/types//test-types";

jest.mock("@/config/items");
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

describe("Search & Filter Tests", () => {
  const mockItems = [createMockItem({ title: "iPhone 13" })];

  beforeEach(() => {
    jest.clearAllMocks();
    mockListItems.mockResolvedValue(createMockResponse(mockItems));
  });

  describe("Search Functionality", () => {
    it("should debounce search input", async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });

      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByText("iPhone 13")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText("Search items...");
      await user.type(searchInput, "Mac");

      expect(mockListItems).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(mockListItems).toHaveBeenCalledWith(
          expect.objectContaining({
            search: "Mac",
          }),
          expect.any(AbortSignal)
        );
      });

      jest.useRealTimers();
    });

    it("should reset page to 1 when searching", async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });

      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByText("iPhone 13")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText("Search items...");
      await user.type(searchInput, "test");

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(mockListItems).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 1,
          }),
          expect.any(AbortSignal)
        );
      });

      jest.useRealTimers();
    });

    it("should cancel debounced search on rapid typing", async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });

      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByText("iPhone 13")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText("Search items...");

      await user.type(searchInput, "i");
      jest.advanceTimersByTime(200);

      await user.type(searchInput, "Ph");
      jest.advanceTimersByTime(200);

      await user.type(searchInput, "one");
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(mockListItems).toHaveBeenLastCalledWith(
          expect.objectContaining({
            search: "iPhone",
          }),
          expect.any(AbortSignal)
        );
      });

      jest.useRealTimers();
    });
  });

  describe("Status Filter", () => {
    it("should filter by available status", async () => {
      const user = userEvent.setup();
      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByText("iPhone 13")).toBeInTheDocument();
      });

      const statusSelect = screen.getAllByRole("combobox")[0];
      await user.selectOptions(statusSelect, "available");

      await waitFor(() => {
        expect(mockListItems).toHaveBeenCalledWith(
          expect.objectContaining({
            status: "available",
          }),
          expect.any(AbortSignal)
        );
      });
    });

    it("should filter by sold status", async () => {
      const user = userEvent.setup();
      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByText("iPhone 13")).toBeInTheDocument();
      });

      const statusSelect = screen.getAllByRole("combobox")[0];
      await user.selectOptions(statusSelect, "sold");

      await waitFor(() => {
        expect(mockListItems).toHaveBeenCalledWith(
          expect.objectContaining({
            status: "sold",
            page: 1,
          }),
          expect.any(AbortSignal)
        );
      });
    });

    it("should clear status filter", async () => {
      const user = userEvent.setup();
      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByText("iPhone 13")).toBeInTheDocument();
      });

      const statusSelect = screen.getAllByRole("combobox")[0];

      await user.selectOptions(statusSelect, "available");
      await user.selectOptions(statusSelect, "");

      await waitFor(() => {
        expect(mockListItems).toHaveBeenLastCalledWith(
          expect.objectContaining({
            status: "",
          }),
          expect.any(AbortSignal)
        );
      });
    });
  });

  describe("Category Filter", () => {
    it("should filter by electronics category", async () => {
      const user = userEvent.setup();
      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByText("iPhone 13")).toBeInTheDocument();
      });

      const categorySelect = screen.getAllByRole("combobox")[1];
      await user.selectOptions(categorySelect, "electronics");

      await waitFor(() => {
        expect(mockListItems).toHaveBeenCalledWith(
          expect.objectContaining({
            category: "electronics",
            page: 1,
          }),
          expect.any(AbortSignal)
        );
      });
    });

    it("should filter by clothing category", async () => {
      const user = userEvent.setup();
      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByText("iPhone 13")).toBeInTheDocument();
      });

      const categorySelect = screen.getAllByRole("combobox")[1];
      await user.selectOptions(categorySelect, "clothing");

      await waitFor(() => {
        expect(mockListItems).toHaveBeenCalledWith(
          expect.objectContaining({
            category: "clothing",
          }),
          expect.any(AbortSignal)
        );
      });
    });
  });

  describe("Sort Functionality", () => {
    it("should sort by price ascending", async () => {
      const user = userEvent.setup();
      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByText("iPhone 13")).toBeInTheDocument();
      });

      const sortSelect = screen.getAllByRole("combobox")[2];
      await user.selectOptions(sortSelect, "price");

      await waitFor(() => {
        expect(mockListItems).toHaveBeenCalledWith(
          expect.objectContaining({
            sortBy: "price",
            sortOrder: "asc",
          }),
          expect.any(AbortSignal)
        );
      });
    });

    it("should toggle sort order", async () => {
      const user = userEvent.setup();
      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByText("iPhone 13")).toBeInTheDocument();
      });

      const sortSelect = screen.getAllByRole("combobox")[2];
      await user.selectOptions(sortSelect, "price");

      await waitFor(() => {
        expect(screen.getByLabelText(/Sort ascending/i)).toBeInTheDocument();
      });

      const sortToggle = screen.getByLabelText(/Sort ascending/i);
      await user.click(sortToggle);

      await waitFor(() => {
        expect(mockListItems).toHaveBeenCalledWith(
          expect.objectContaining({
            sortOrder: "desc",
          }),
          expect.any(AbortSignal)
        );
      });
    });

    it("should sort by title", async () => {
      const user = userEvent.setup();
      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByText("iPhone 13")).toBeInTheDocument();
      });

      const sortSelect = screen.getAllByRole("combobox")[2];
      await user.selectOptions(sortSelect, "title");

      await waitFor(() => {
        expect(mockListItems).toHaveBeenCalledWith(
          expect.objectContaining({
            sortBy: "title",
          }),
          expect.any(AbortSignal)
        );
      });
    });

    it("should hide sort order button when no sort selected", async () => {
      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByText("iPhone 13")).toBeInTheDocument();
      });

      expect(screen.queryByLabelText(/Sort/i)).not.toBeInTheDocument();
    });
  });

  describe("Combined Filters", () => {
    it("should apply search, status, and category together", async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });

      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByText("iPhone 13")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText("Search items...");
      await user.type(searchInput, "phone");
      jest.advanceTimersByTime(500);

      const statusSelect = screen.getAllByRole("combobox")[0];
      await user.selectOptions(statusSelect, "available");

      const categorySelect = screen.getAllByRole("combobox")[1];
      await user.selectOptions(categorySelect, "electronics");

      await waitFor(() => {
        expect(mockListItems).toHaveBeenCalledWith(
          expect.objectContaining({
            search: "phone",
            status: "available",
            category: "electronics",
          }),
          expect.any(AbortSignal)
        );
      });

      jest.useRealTimers();
    });
  });
});
