"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import ItemCard from "@/components/Marketplace/ItemCard";
import Pagination from "@/components/Marketplace/Pagination";
import debounce from "lodash.debounce";
import { listItems, Item, ListItemsResponse } from "../../config/items";

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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState<SortOptions>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res: ListItemsResponse = await listItems({
        page,
        limit,
        search,
        category,
        status,
        sortBy: sortBy || undefined,
        sortOrder,
      });

      if (res.success) {
        setItems(res.data.items);
        setTotalPages(res.data.pagination.totalPages);
      } else {
        setItems([]);
        setTotalPages(1);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Fetch items error:", err.message);
      } else {
        console.error("Fetch items error:", err);
      }
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, category, status, sortBy, sortOrder]);

  const debouncedSearch = useMemo(
    () =>
      debounce((val: string) => {
        setPage(1);
        setSearch(val);
      }, 500),
    [setPage, setSearch]
  );

  useEffect(() => {
    fetchItems();
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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between flex-wrap">
          <input
            type="text"
            placeholder="Search items..."
            onChange={(e) => debouncedSearch(e.target.value)}
            className="flex-1 p-3 rounded-xl border border-gray-300 focus:border-[#69773D] focus:ring-2 focus:ring-[#69773D] outline-none"
          />
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
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
                className="px-3 py-2 bg-green-200 rounded-xl"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            )}
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: limit }).map((_, i) => (
              <div
                key={i}
                className="h-64 bg-gray-200 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <p className="text-xl font-medium">No items found</p>
            <p>Try changing your filters or search keyword.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
