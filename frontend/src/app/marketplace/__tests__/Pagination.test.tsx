import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import MarketPage from "../page";
import { listItems } from "@/config/items";
import type { MockListItems } from "@/test/types//test-types";
import { createMockItem, createMockResponse } from "@/test/types//test-types";
import { skip } from "node:test";

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

const mockListItems = listItems as MockListItems;

describe("Pagination Tests", () => {
  const mockItems = [createMockItem({ title: "Item 1" })];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Pagination Display", () => {
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
      mockListItems.mockResolvedValue(createMockResponse([]));

      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByText("No items found")).toBeInTheDocument();
      });

      expect(screen.queryByTestId("pagination")).not.toBeInTheDocument();
    });

    // it("should display current page info", async () => {
    //   mockListItems.mockResolvedValue(
    //     createMockResponse(mockItems, {
    //       currentPage: 2,
    //       totalPages: 5,
    //       totalItems: 50,
    //     })
    //   );

    //   render(<MarketPage />);

    //   await waitFor(() => {
    //     expect(screen.getByTestId("page-info")).toHaveTextContent(
    //       "Page 2 of 5"
    //     );
    //   });
    // });
  });

  describe("Page Navigation", () => {
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
          expect.objectContaining({
            page: 2,
          }),
          expect.any(AbortSignal)
        );
      });
    });

    it("should navigate to previous page", async () => {
      mockListItems.mockResolvedValueOnce(
        createMockResponse(mockItems, {
          currentPage: 2,
          totalPages: 3,
          totalItems: 30,
        })
      );

      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByTestId("prev-page")).toBeInTheDocument();
      });

      mockListItems.mockResolvedValueOnce(
        createMockResponse(mockItems, {
          currentPage: 1,
          totalPages: 3,
          totalItems: 30,
        })
      );

      fireEvent.click(screen.getByTestId("prev-page"));

      await waitFor(() => {
        expect(mockListItems).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 1,
          }),
          expect.any(AbortSignal)
        );
      });
    });

    it("should navigate to first page", async () => {
      mockListItems.mockResolvedValueOnce(
        createMockResponse(mockItems, {
          currentPage: 3,
          totalPages: 5,
          totalItems: 50,
        })
      );

      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByTestId("first-page")).toBeInTheDocument();
      });

      mockListItems.mockResolvedValueOnce(
        createMockResponse(mockItems, {
          currentPage: 1,
          totalPages: 5,
          totalItems: 50,
        })
      );

      fireEvent.click(screen.getByTestId("first-page"));

      await waitFor(() => {
        expect(mockListItems).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 1,
          }),
          expect.any(AbortSignal)
        );
      });
    });

    it("should navigate to last page", async () => {
      mockListItems.mockResolvedValueOnce(
        createMockResponse(mockItems, {
          currentPage: 1,
          totalPages: 5,
          totalItems: 50,
        })
      );

      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByTestId("last-page")).toBeInTheDocument();
      });

      mockListItems.mockResolvedValueOnce(
        createMockResponse(mockItems, {
          currentPage: 5,
          totalPages: 5,
          totalItems: 50,
        })
      );

      fireEvent.click(screen.getByTestId("last-page"));

      await waitFor(() => {
        expect(mockListItems).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 5,
          }),
          expect.any(AbortSignal)
        );
      });
    });
  });

  skip("Pagination State", () => {
    it("should reset to page 1 when changing search", async () => {
      jest.useFakeTimers();

      mockListItems
        .mockResolvedValueOnce(
          createMockResponse(mockItems, {
            currentPage: 3,
            totalPages: 5,
            totalItems: 50,
          })
        )
        .mockResolvedValue(
          createMockResponse(mockItems, {
            currentPage: 1,
            totalPages: 5,
            totalItems: 50,
          })
        );

      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByTestId("page-info")).toHaveTextContent(
          "Page 3 of 5"
        );
      });

      const searchInput = screen.getByPlaceholderText("Search items...");
      fireEvent.change(searchInput, { target: { value: "new search" } });

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(mockListItems).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 1,
            search: "new search",
          }),
          expect.any(AbortSignal)
        );
      });

      jest.useRealTimers();
    });

    it("should update totalPages from API response", async () => {
      mockListItems.mockResolvedValue(
        createMockResponse(mockItems, {
          currentPage: 1,
          totalPages: 10,
          totalItems: 100,
        })
      );

      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByTestId("page-info")).toHaveTextContent(
          "Page 1 of 10"
        );
      });
    });
  });

  describe("Edge Cases", () => {
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
        expect(screen.getByTestId("page-info")).toHaveTextContent(
          "Page 1 of 1"
        );
      });
    });

    it("should handle error and reset pagination", async () => {
      mockListItems.mockRejectedValue(new Error("Network error"));

      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load items/i)).toBeInTheDocument();
      });

      expect(screen.queryByTestId("pagination")).not.toBeInTheDocument();
    });

    it("should not show pagination on empty results", async () => {
      mockListItems.mockResolvedValue({
        success: false,
        data: {
          items: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            limit: 12,
          },
        },
      });

      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByText("Failed to load items")).toBeInTheDocument();
      });

      expect(screen.queryByTestId("pagination")).not.toBeInTheDocument();
    });
  });

  describe("Pagination with Sorting", () => {
    it("should reset page when changing sort", async () => {
      mockListItems
        .mockResolvedValueOnce(
          createMockResponse(mockItems, {
            currentPage: 2,
            totalPages: 3,
            totalItems: 30,
          })
        )
        .mockResolvedValue(
          createMockResponse(mockItems, {
            currentPage: 1,
            totalPages: 3,
            totalItems: 30,
          })
        );

      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByTestId("page-info")).toHaveTextContent(
          "Page 2 of 3"
        );
      });

      const sortSelect = screen.getAllByRole("combobox")[2];
      fireEvent.change(sortSelect, { target: { value: "price" } });

      await waitFor(() => {
        expect(mockListItems).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 1,
            sortBy: "price",
          }),
          expect.any(AbortSignal)
        );
      });
    });
  });

  describe("Loading During Pagination", () => {
    it("should show loading state when changing pages", async () => {
      mockListItems.mockResolvedValueOnce(
        createMockResponse(mockItems, {
          currentPage: 1,
          totalPages: 3,
          totalItems: 30,
        })
      );

      render(<MarketPage />);

      await waitFor(() => {
        expect(screen.getByText("Item 1")).toBeInTheDocument();
      });

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
});
