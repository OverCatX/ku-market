"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import ItemCard from "@/components/Marketplace/ItemCard";
import Pagination from "@/components/Marketplace/Pagination";
import debounce from "lodash.debounce";
import { listItems, Item, ListItemsResponse } from "../../config/items";

const LIGHT = "#f9f9f7";
const GREEN = "#69773D";

type SortOptions =
  | "price"
  | "title"
  | "createAt"
  | "updateAt"
  | "relevance"
  | "";

export default function MarketPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(12); // removed setLimit since it's not used
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState<SortOptions>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchItems = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const res: ListItemsResponse = await listItems(
        {
          page,
          limit,
          search,
          category,
          status,
          sortBy: sortBy || undefined,
          sortOrder,
        },
        abortControllerRef.current.signal
      );

      if (res.success) {
        setItems(res.data.items);
        setTotalPages(res.data.pagination.totalPages);
      } else {
        setItems([]);
        setTotalPages(1);
        setError("Failed to load items");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        // Request was cancelled, ignore
        return;
      }
      console.error("Fetch items error:", err);
      setError("Failed to load items. Please try again.");
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, category, status, sortBy, sortOrder]);

  // Cleanup debounce on unmount
  const debouncedSearch = useMemo(() => {
    const fn = debounce((val: string) => {
      setPage(1);
      setSearch(val);
    }, 500);

    return fn;
  }, []);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    fetchItems();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchItems]);

  const statusOptions = ["", "available", "reserved", "sold"] as const;
  const categoryOptions = ["", "electronics", "clothing", "books"] as const;
  const sortOptions: { label: string; value: SortOptions }[] = [
    { label: "Sort By", value: "" },
    { label: "Price", value: "price" },
    { label: "Title", value: "title" },
    { label: "Newest", value: "createAt" },
    { label: "Updated", value: "updateAt" },
    { label: "Relevance", value: "relevance" },
  ];

  return (
    <div className="min-h-screen" style={{ background: LIGHT }}>
      {/* Top bar */}
      <div className="w-full" style={{ background: GREEN }}>
        <div className="mx-auto max-w-6xl px-6 py-4 text-white font-medium">
          Marketplace
        </div>
      </div>

      {/* Container */}
      <main className="mx-auto max-w-6xl px-6 py-6 bg-white rounded-2xl shadow mt-6">
        {/* Breadcrumb */}
        <p className="text-sm text-gray-500 mb-6">
          marketplace / <span className="text-gray-700">browse</span>
        </p>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between flex-wrap mb-6">
          <input
            type="text"
            placeholder="Search items..."
            onChange={(e) => debouncedSearch(e.target.value)}
            className="flex-1 p-3 rounded-xl border border-gray-300 focus:border-[#69773D] focus:ring-2 focus:ring-[#69773D] outline-none"
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
              className="p-2 rounded-xl border border-gray-300"
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt
                    ? opt.charAt(0).toUpperCase() + opt.slice(1)
                    : "All Status"}
                </option>
              ))}
            </select>
            <select
              value={category}
              onChange={(e) => {
                setPage(1);
                setCategory(e.target.value);
              }}
              className="p-2 rounded-xl border border-gray-300"
            >
              {categoryOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt
                    ? opt.charAt(0).toUpperCase() + opt.slice(1)
                    : "All Categories"}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => {
                setPage(1);
                setSortBy(e.target.value as SortOptions);
              }}
              className="p-2 rounded-xl border border-gray-300"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {sortBy && (
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="px-3 py-2 bg-green-200 rounded-xl hover:bg-green-300 transition-colors"
                aria-label={`Sort ${
                  sortOrder === "asc" ? "ascending" : "descending"
                }`}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
            <button
              onClick={fetchItems}
              className="ml-2 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: limit }).map((_, i) => (
              <div
                key={i}
                className="h-64 bg-gray-200 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-500 py-20">
            <p className="text-xl font-medium mb-2">No items found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ItemCard
                key={item._id}
                id={item._id}
                title={item.title}
                description={item.description}
                price={item.price}
                photo={item.photo[0] || ""}
                status={item.status}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {items.length > 0 && (
          <div className="mt-8">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </main>
    </div>
  );
}
