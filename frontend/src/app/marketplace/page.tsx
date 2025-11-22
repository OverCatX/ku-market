"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import ItemCard from "@/components/Marketplace/ItemCard";
import Link from "next/link";
import Pagination from "@/components/Marketplace/Pagination";
import debounce from "lodash.debounce";
import { listItems, Item, ListItemsResponse } from "../../config/items";
import { getCategories, Category } from "../../config/categories";
import { getBatchReviewSummaries } from "../../config/reviews";
import dynamic from "next/dynamic";
import { HelpCircle } from "lucide-react";

// Lazy load FooterSection to reduce initial bundle
const FooterSection = dynamic(() => import("@/components/home/FooterSection"), {
  ssr: false,
  loading: () => <div className="h-32" />,
});

const GREEN = "#69773D";

type SortOptions =
  | "price"
  | "title"
  | "createAt"
  | "updateAt"
  | "relevance"
  | "";

interface ItemWithRating extends Item {
  rating?: number;
  totalReviews?: number;
}

export default function MarketPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();

  // Initialize state from URL params for better UX and shareable links
  const [items, setItems] = useState<Item[] | null>(null);
  const [itemsWithRating, setItemsWithRating] = useState<ItemWithRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);

  // Get filter values from URL params
  const currentPage = useMemo(() => {
    const page = searchParams.get("page");
    return page ? Math.max(1, parseInt(page, 10)) : 1;
  }, [searchParams]);

  const search = useMemo(
    () => searchParams.get("search") || "",
    [searchParams]
  );
  const category = useMemo(
    () => searchParams.get("category") || "",
    [searchParams]
  );
  const status = useMemo(
    () => searchParams.get("status") || "",
    [searchParams]
  );
  const sortBy = useMemo(
    () => (searchParams.get("sortBy") || "") as SortOptions,
    [searchParams]
  );
  const sortOrder = useMemo(
    () => (searchParams.get("sortOrder") || "asc") as "asc" | "desc",
    [searchParams]
  );

  const abortControllerRef = useRef<AbortController | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Update URL params without causing navigation
  const updateURLParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Reset to page 1 when filters change (unless explicitly setting page)
      if (
        !updates.page &&
        (updates.search !== undefined ||
          updates.category !== undefined ||
          updates.status !== undefined ||
          updates.sortBy !== undefined)
      ) {
        params.set("page", "1");
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Load categories on mount
  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  // Sync search input with URL param
  useEffect(() => {
    if (searchInputRef.current && searchInputRef.current.value !== search) {
      searchInputRef.current.value = search;
    }
  }, [search]);

  const fetchItems = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);
    // While fetching, set items to null so UI shows skeleton instead of "No items"
    setItems(null);

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

        // Sync page in URL if backend returned different page
        if (res.data.pagination.currentPage !== currentPage) {
          updateURLParams({ page: String(res.data.pagination.currentPage) });
        }

        // Fetch review summaries for all items using batch API (more efficient)
        const fetchRatings = async () => {
          try {
            const itemIds = res.data.items.map((item: Item) => item._id);
            const summaries = await getBatchReviewSummaries(itemIds);

            const itemsWithRatings = res.data.items.map((item: Item) => {
              const summary = summaries[item._id];
                return {
                  ...item,
                rating: summary?.averageRating || 0,
                totalReviews: summary?.totalReviews || 0,
                };
            });

            setItemsWithRating(itemsWithRatings);
          } catch {
            // If fetching ratings fails, just use items without ratings
            setItemsWithRating(
              res.data.items.map((item: Item) => ({
                ...item,
                rating: 0,
                totalReviews: 0,
              }))
            );
          }
        };

        fetchRatings();
      } else {
        setItems([]);
        setItemsWithRating([]);
        setTotalPages(1);
        setError("Failed to load items");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        // Request was cancelled, ignore
        return;
      }
      // Only log non-AbortError errors
      if (err instanceof Error) {
      }
      setError(
        "Failed to load items. Please check your connection and try again."
      );
      setItems([]);
      setItemsWithRating([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    limit,
    search,
    category,
    status,
    sortBy,
    sortOrder,
    updateURLParams,
  ]);

  // Optimized debounced search with URL update - faster for better UX
  const debouncedSearch = useMemo(() => {
    return debounce((val: string) => {
      const trimmedVal = val.trim();
      updateURLParams({ search: trimmedVal || null });
    }, 300); // Optimized: 300ms for responsive feel while reducing API calls
  }, [updateURLParams]);

  // Cleanup debounce on unmount
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

  // Memoize static options to prevent re-creation
  const statusOptions = useMemo(
    () => ["", "available", "reserved", "sold"] as const,
    []
  );
  const sortOptions = useMemo<{ label: string; value: SortOptions }[]>(
    () => [
    { label: "Sort By", value: "" },
      { label: "Newest Updated", value: "updateAt" }, // Default and most useful
    { label: "Price", value: "price" },
    { label: "Title", value: "title" },
      { label: "Newest Created", value: "createAt" },
    { label: "Relevance", value: "relevance" },
    ],
    []
  );

  // Optimized clear filters with URL update
  const clearFilters = useCallback(() => {
    updateURLParams({
      search: null,
      category: null,
      status: null,
      sortBy: null,
      sortOrder: null,
      page: null,
    });
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
  }, [updateURLParams]);

  // Memoize active filter chips
  const activeFilterChips = useMemo(() => {
    return [
    search ? { key: "search", label: `Search: ${search}` } : null,
    category ? { key: "category", label: `Category: ${category}` } : null,
    status ? { key: "status", label: `Status: ${status}` } : null,
      sortBy
        ? { key: "sortBy", label: `Sort: ${sortBy} (${sortOrder})` }
        : null,
  ].filter(Boolean) as { key: string; label: string }[];
  }, [search, category, status, sortBy, sortOrder]);

  // Optimized filter handlers
  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateURLParams({ status: e.target.value || null });
    },
    [updateURLParams]
  );

  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateURLParams({ category: e.target.value || null });
    },
    [updateURLParams]
  );

  const handleSortByChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateURLParams({ sortBy: e.target.value || null });
    },
    [updateURLParams]
  );

  const handleSortOrderToggle = useCallback(() => {
    updateURLParams({ sortOrder: sortOrder === "asc" ? "desc" : "asc" });
  }, [sortOrder, updateURLParams]);

  const handlePageChange = useCallback(
    (page: number) => {
      updateURLParams({ page: String(page) });
      // Scroll to top smoothly when page changes
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [updateURLParams]
  );

  const handleRemoveFilter = useCallback(
    (filterKey: string) => {
      switch (filterKey) {
        case "search":
          updateURLParams({ search: null });
          if (searchInputRef.current) {
            searchInputRef.current.value = "";
          }
          break;
        case "category":
          updateURLParams({ category: null });
          break;
        case "status":
          updateURLParams({ status: null });
          break;
        case "sortBy":
          updateURLParams({ sortBy: null, sortOrder: null });
          break;
      }
    },
    [updateURLParams]
  );

  // Memoize display items to prevent unnecessary re-renders
  const displayItems = useMemo(() => {
    return itemsWithRating.length > 0 ? itemsWithRating : items || [];
  }, [itemsWithRating, items]);

  return (
    <div className="min-h-screen" style={{ background: '#F6F2E5' }}>
      {/* Top bar */}
      <div className="w-full" style={{ background: GREEN }}>
        <div className="mx-auto max-w-6xl px-6 py-4 text-white font-medium">
          Marketplace
        </div>
      </div>

      {/* Container */}
      <main className="mx-auto max-w-6xl px-6 py-6 bg-white rounded-2xl shadow mt-6">
        {/* Breadcrumb & Guide Button */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
          marketplace / <span className="text-gray-700">browse</span>
        </p>
          <Link
            href="/guide"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#69773D] text-white rounded-lg hover:bg-[#5a632d] transition-colors text-sm font-medium shadow-sm hover:shadow-md"
          >
            <HelpCircle size={18} />
            User Guide
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between flex-wrap mb-6">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search items..."
            defaultValue={search}
            onChange={(e) => debouncedSearch(e.target.value)}
            className="flex-1 p-3 rounded-xl border border-gray-300 bg-[#f7f5ed] focus:border-[#4A5130] focus:ring-2 focus:ring-[#4A5130] outline-none"
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={status}
              onChange={handleStatusChange}
              className="p-2 rounded-xl border border-gray-300 bg-white focus:border-[#4A5130] focus:ring-2 focus:ring-[#4A5130] outline-none"
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
              onChange={handleCategoryChange}
              className="p-2 rounded-xl border border-gray-300 bg-white focus:border-[#4A5130] focus:ring-2 focus:ring-[#4A5130] outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={handleSortByChange}
              className="p-2 rounded-xl border border-gray-300 bg-white focus:border-[#4A5130] focus:ring-2 focus:ring-[#4A5130] outline-none"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {sortBy && (
              <button
                onClick={handleSortOrderToggle}
                className="px-3 py-2 bg-[#e7efdb] rounded-xl hover:bg-[#d4e0c5] transition-colors"
                aria-label={`Sort ${
                  sortOrder === "asc" ? "ascending" : "descending"
                }`}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            )}

            {activeFilterChips.length > 0 && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 bg-[#780606]/70 text-[#F6F2E5] rounded-xl hover:bg-[#780606]/80 transition-colors"
                aria-label="Clear filters"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Active filters chips */}
        {activeFilterChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {activeFilterChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f7f5ed] text-gray-700 text-sm"
              >
                {chip.label}
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => handleRemoveFilter(chip.key)}
                  aria-label={`Remove ${chip.key}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Results count */}
        {Array.isArray(items) && (
          <div className="text-sm text-gray-500 mb-4">
            Showing {items.length} result{items.length === 1 ? "" : "s"}
            {totalPages > 1 ? ` • Page ${currentPage} of ${totalPages}` : ""}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-[#780606]/10 border border-[#780606]/30 rounded-xl text-[#780606]">
            {error}
            <button
              onClick={fetchItems}
              className="ml-2 underline hover:no-underline text-[#780606]"
            >
              Retry
            </button>
          </div>
        )}

        {/* Items Grid */}
        {/* Items Grid */}
        {loading || items === null ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 md:gap-4 lg:gap-5 justify-items-center">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 md:gap-4 lg:gap-5">
            <AnimatePresence mode="popLayout">
              {displayItems.map((item) => (
                  <motion.div
                    key={item._id}
                  layout={!prefersReducedMotion}
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 12 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? {} : { opacity: 0, y: 12 }}
                  whileHover={
                    prefersReducedMotion ? {} : { y: -4, scale: 1.01 }
                  }
                  transition={
                    prefersReducedMotion
                      ? {}
                      : { duration: 0.15, ease: "easeOut" }
                  }
                    className="h-full transition-shadow"
                  >
                    <Link
                      href={`/marketplace/${item._id}`}
                      className="block h-full"
                    prefetch={false}
                    >
                      <ItemCard
                        id={item._id}
                        title={item.title}
                        description={item.description}
                        price={item.price}
                        photo={item.photo[0] || ""}
                        status={item.status}
                        rating={(item as ItemWithRating).rating}
                        totalReviews={(item as ItemWithRating).totalReviews}
                      />
                    </Link>
                  </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {Array.isArray(items) && items.length > 0 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </main>
      <div className="mt-12">
        <FooterSection />
      </div>
    </div>
  );
}
