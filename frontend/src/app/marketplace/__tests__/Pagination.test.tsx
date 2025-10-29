import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
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
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          data-testid="first-page"
        >
          First
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          data-testid="prev-page"
        >
          Previous
        </button>
        <span data-testid="page-info">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          data-testid="next-page"
        >
          Next
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          data-testid="last-page"
        >
          Last
        </button>
      </div>
    );
  };
});

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

const mockListItems = listItems as MockListItems;

describe("Pagination Tests", () => {
  const mockItems = [createMockItem({ title: "Item 1" })];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers(); // สำหรับ debounce / async update
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should show pagination when items exist", async () => {
    mockListItems.mockResolvedValue(
      createMockResponse(mockItems, { totalPages: 3, totalItems: 30 })
    );

    render(<MarketPage />);

    await waitFor(() => {
      expect(screen.getByTestId("pagination")).toBeInTheDocument();
    });
  });

  it("should not show pagination when no items", async () => {
    mockListItems.mockResolvedValue(createMockResponse([], { totalPages: 0 }));

    render(<MarketPage />);

    await waitFor(() => {
      expect(screen.getByText("No items found")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("pagination")).not.toBeInTheDocument();
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

    await waitFor(() => {
      expect(screen.getByTestId("next-page")).toBeInTheDocument();
    });

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

  it("should reset page to 1 when changing search", async () => {
    // First render - page 1
    mockListItems.mockResolvedValueOnce(
      createMockResponse(mockItems, {
        currentPage: 1,
        totalPages: 5,
        totalItems: 50,
      })
    );

    render(<MarketPage />);

    await waitFor(() => {
      expect(screen.getByTestId("page-info")).toHaveTextContent("Page 1 of 5");
    });

    // Navigate to page 2 (one click)
    mockListItems.mockResolvedValueOnce(
      createMockResponse(mockItems, {
        currentPage: 2,
        totalPages: 5,
        totalItems: 50,
      })
    );

    const nextButton = await screen.findByTestId("next-page");
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByTestId("page-info")).toHaveTextContent("Page 2 of 5");
    });

    // Now search - should reset to page 1
    mockListItems.mockResolvedValueOnce(
      createMockResponse(mockItems, {
        currentPage: 1,
        totalPages: 5,
        totalItems: 50,
      })
    );

    const searchInput = screen.getByPlaceholderText("Search items...");
    fireEvent.change(searchInput, { target: { value: "new search" } });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(mockListItems).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, search: "new search" }),
        expect.any(AbortSignal)
      );
    });
  });

  it("should handle single page", async () => {
    mockListItems.mockResolvedValue(
      createMockResponse(mockItems, {
        currentPage: 1,
        totalPages: 1,
        totalItems: 5,
      })
    );

    render(<MarketPage />);

    await waitFor(() => {
      expect(screen.getByTestId("page-info")).toHaveTextContent("Page 1 of 1");
    });
  });

  it("should show loading skeleton when changing pages", async () => {
    mockListItems.mockResolvedValueOnce(
      createMockResponse(mockItems, {
        currentPage: 1,
        totalPages: 3,
        totalItems: 30,
      })
    );

    render(<MarketPage />);

    await waitFor(() => expect(screen.getByText("Item 1")).toBeInTheDocument());

    mockListItems.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve(
                createMockResponse(mockItems, {
                  currentPage: 2,
                  totalPages: 3,
                  totalItems: 30,
                })
              ),
            100
          )
        )
    );

    fireEvent.click(screen.getByTestId("next-page"));

    await waitFor(() => {
      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });
});
