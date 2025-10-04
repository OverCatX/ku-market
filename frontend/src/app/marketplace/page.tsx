"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import ItemCard from "@/components/Marketplace/ItemCard";
import Link from "next/link";
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
  const [currentPage, setCurrentPage] = useState(1);
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
          page: currentPage,
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
        setCurrentPage(res.data.pagination.currentPage);
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
  }, [currentPage, limit, search, category, status, sortBy, sortOrder]);

  // Cleanup debounce on unmount
  const debouncedSearch = useMemo(() => {
    const fn = debounce((val: string) => {
      setCurrentPage(1);
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
                setCurrentPage(1);
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
                setCurrentPage(1);
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
                setCurrentPage(1);
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
        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: limit }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
              >
                {/* Image skeleton */}
                <div className="w-full h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />

                {/* Content skeleton */}
                <div className="p-4 space-y-3">
                  {/* Title skeleton */}
                  <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse w-3/4" />

                  {/* Description skeleton */}
                  <div className="space-y-2">
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse w-full" />
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse w-5/6" />
                  </div>

                  {/* Price and status skeleton */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse w-20" />
                    <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full animate-pulse w-16" />
                  </div>
                </div>
              </div>
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
              <Link
                key={item._id}
                href={`/market/${item._id}`}
                className="block"
              >
                <ItemCard
                  id={item._id}
                  title={item.title}
                  description={item.description}
                  price={item.price}
                  photo={item.photo[0] || ""}
                  status={item.status}
                />
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {items.length > 0 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </main>
    </div>
  );
}
