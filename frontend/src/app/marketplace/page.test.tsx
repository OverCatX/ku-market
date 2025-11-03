import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MarketPage from "./page";
import { listItems } from "@/config/items";
import type { MockListItems } from "@/test/types/test-types";
import { createMockItem, createMockResponse } from "@/test/types/test-types";

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
          data-testid="prev-page"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
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
    jest.useFakeTimers();
    mockListItems.mockResolvedValue(
      createMockResponse(mockItems, { currentPage: 1, totalPages: 1 })
    );
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("renders main sections and items", async () => {
    render(<MarketPage />);
    expect(screen.getByText("Marketplace")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search items...")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("iPhone 13")).toBeInTheDocument();
      expect(screen.getByText("T-Shirt")).toBeInTheDocument();
    });
  });

  it("search input works with debounce", async () => {
    const user = userEvent.setup({ delay: null });
    render(<MarketPage />);
    const searchInput = screen.getByPlaceholderText("Search items...");
    await user.type(searchInput, "iPhone");
    act(() => {
      jest.advanceTimersByTime(500);
    });
    await waitFor(() => {
      expect(mockListItems).toHaveBeenCalledWith(
        expect.objectContaining({ search: "iPhone", page: 1 }),
        expect.any(AbortSignal)
      );
    });
  });

  it("filters by category and status", async () => {
    const user = userEvent.setup({ delay: null });
    render(<MarketPage />);
    const statusSelect = screen.getAllByRole("combobox")[0];
    const categorySelect = screen.getAllByRole("combobox")[1];

    await user.selectOptions(statusSelect, "available");
    await user.selectOptions(categorySelect, "electronics");

    await waitFor(() => {
      expect(mockListItems).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "available",
          category: "electronics",
          page: 1,
        }),
        expect.any(AbortSignal)
      );
    });
  });

  it("sorts items by price and toggles order", async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    render(<MarketPage />);
    const sortSelect = screen.getAllByRole("combobox")[2];
    await user.selectOptions(sortSelect, "price");

    // simulate toggling sort order if button exists
    const sortToggle = screen.queryByLabelText(/Sort ascending/i);
    if (sortToggle) await user.click(sortToggle);

    await waitFor(() => {
      expect(mockListItems).toHaveBeenLastCalledWith(
        expect.objectContaining({ sortBy: "price" }),
        expect.any(AbortSignal)
      );
    });
    jest.useFakeTimers();
  });

  it("resets page to 1 when applying filters", async () => {
    jest.useRealTimers();
    // First render - page 1
    mockListItems.mockResolvedValueOnce(
      createMockResponse(mockItems, { currentPage: 1, totalPages: 3 })
    );
    render(<MarketPage />);
    await waitFor(() => {
      expect(screen.getByTestId("page-info")).toHaveTextContent("Page 1 of 3");
    });

    // Navigate to page 2
    mockListItems.mockResolvedValueOnce(
      createMockResponse(mockItems, { currentPage: 2, totalPages: 3 })
    );
    const nextButton = await screen.findByTestId("next-page");
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByTestId("page-info")).toHaveTextContent("Page 2 of 3");
    });

    // Apply filter - should reset to page 1
    mockListItems.mockResolvedValueOnce(
      createMockResponse(mockItems, { currentPage: 1, totalPages: 3 })
    );

    const user = userEvent.setup();
    const statusSelect = screen.getAllByRole("combobox")[0];
    await user.selectOptions(statusSelect, "sold");

    await waitFor(() => {
      expect(mockListItems).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 }),
        expect.any(AbortSignal)
      );
    });
    jest.useFakeTimers();
  });

  it("handles errors and retry", async () => {
    mockListItems.mockRejectedValueOnce(new Error("Network error"));
    render(<MarketPage />);
    await waitFor(() => {
      expect(screen.getByText(/Failed to load items/i)).toBeInTheDocument();
    });

    mockListItems.mockResolvedValueOnce(createMockResponse(mockItems));
    fireEvent.click(screen.getByText("Retry"));

    await waitFor(() => {
      expect(screen.getByText("iPhone 13")).toBeInTheDocument();
    });
  });

  it("navigates pages using pagination", async () => {
    mockListItems.mockResolvedValueOnce(
      createMockResponse(mockItems, { currentPage: 1, totalPages: 3 })
    );
    render(<MarketPage />);
    await waitFor(() =>
      expect(screen.getByTestId("page-info")).toHaveTextContent("Page 1 of 3")
    );

    mockListItems.mockResolvedValueOnce(
      createMockResponse(mockItems, { currentPage: 2, totalPages: 3 })
    );
    fireEvent.click(screen.getByTestId("next-page"));

    await waitFor(() => {
      expect(mockListItems).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 }),
        expect.any(AbortSignal)
      );
    });
  });

  it("completes full user journey with search, filter, sort, pagination", async () => {
    const user = userEvent.setup({ delay: null });
    render(<MarketPage />);

    const searchInput = screen.getByPlaceholderText("Search items...");
    await user.type(searchInput, "iPhone");
    act(() => {
      jest.advanceTimersByTime(500);
    });

    const categorySelect = screen.getAllByRole("combobox")[1];
    await user.selectOptions(categorySelect, "electronics");

    const sortSelect = screen.getAllByRole("combobox")[2];
    await user.selectOptions(sortSelect, "price");

    const sortToggle = screen.queryByLabelText(/Sort ascending/i);
    if (sortToggle) await user.click(sortToggle);

    await waitFor(() => {
      expect(mockListItems).toHaveBeenLastCalledWith(
        expect.objectContaining({
          search: "iPhone",
          category: "electronics",
          sortBy: "price",
        }),
        expect.any(AbortSignal)
      );
    });
  });
});
