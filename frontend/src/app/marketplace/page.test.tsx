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
    mockPush.mockClear();
    mockReplace.mockClear();
    // Reset search params
    mockSearchParams = new URLSearchParams();
    jest.useFakeTimers();
    mockListItems.mockResolvedValue(
      createMockResponse(mockItems, { currentPage: 1, totalPages: 1 })
    );
  });

  afterEach(() => {
    try {
      jest.runOnlyPendingTimers();
    } catch (e) {
      // Ignore if no fake timers are active
    }
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
    
    // Wait for initial load
    await waitFor(() => {
      expect(mockListItems).toHaveBeenCalled();
    });
    
    const searchInput = screen.getByPlaceholderText("Search items...");
    await user.type(searchInput, "iPhone");
    
    // Advance timers to trigger debounce
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    
    // Wait for the debounced search to trigger
    await waitFor(() => {
      expect(mockListItems).toHaveBeenCalledWith(
        expect.objectContaining({ search: "iPhone", page: 1 }),
        expect.any(AbortSignal)
      );
    }, { timeout: 2000 });
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

});
