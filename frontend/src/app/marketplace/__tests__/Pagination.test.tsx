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

const mockListItems = listItems as MockListItems;

// Mock window.scrollTo
Object.defineProperty(window, "scrollTo", {
  value: jest.fn(),
  writable: true,
});

describe("Pagination Tests", () => {
  const mockItems = [createMockItem({ title: "Item 1" })];

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    mockReplace.mockClear();
    // Reset search params
    mockSearchParams = new URLSearchParams();
    jest.useRealTimers(); // Use real timers for pagination tests
  });

  afterEach(() => {
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


  it("should handle single page", async () => {
    mockListItems.mockResolvedValueOnce(
      createMockResponse(mockItems, {
        currentPage: 1,
        totalPages: 1,
        totalItems: 5,
      })
    );

    render(<MarketPage />);

    await waitFor(() => {
      expect(screen.getByTestId("page-info")).toHaveTextContent("Page 1 of 1");
    }, { timeout: 3000 });
  });

});
