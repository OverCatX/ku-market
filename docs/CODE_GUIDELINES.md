# Code Guidelines & Performance Optimization

This document outlines the key performance optimization techniques used in the KU Market project to ensure fast, efficient, and scalable code.

## Table of Contents

1. [Frontend Optimizations](#frontend-optimizations)
2. [Backend Optimizations](#backend-optimizations)
3. [Best Practices](#best-practices)

---

## Frontend Optimizations

### 1. React Memoization

#### `React.memo()` - Prevent Unnecessary Re-renders

Use for components that receive stable props but re-render frequently.

```tsx
// ✅ Good: Memoize list items and cards
const ItemCard = memo(({ item, onAction }: ItemCardProps) => {
  return <div>{/* Component content */}</div>;
});

// Used in: ItemCard, TableRow, ReportCard components
```

#### `useMemo()` - Cache Expensive Calculations

Use for filtering, sorting, or derived values.

```tsx
// ✅ Good: Memoize filtered/sorted data
const filteredItems = useMemo(() => {
  return items
    .filter((item) => item.status === "active")
    .sort((a, b) => a.price - b.price);
}, [items]);

// ✅ Good: Memoize static options (never recalculate)
const statusOptions = useMemo(
  () => [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
  ],
  []
);
```

#### `useCallback()` - Stable Function References

Essential for functions used in `useEffect` dependencies or passed to memoized components.

```tsx
// ✅ Good: Memoize functions used in effects
const loadOrders = useCallback(async () => {
  const data = await fetchOrders(page, limit);
  setOrders(data);
}, [page, limit]); // Only recreate when dependencies change

useEffect(() => {
  loadOrders();
}, [loadOrders]); // Stable reference prevents infinite loops

// ✅ Good: Memoize event handlers
const handlePageChange = useCallback((page: number) => {
  setCurrentPage(page);
  window.scrollTo({ top: 0, behavior: "smooth" });
}, []); // Empty deps = never recreate
```

**Real Use Cases:**

- `frontend/src/app/(seller)/seller/orders/page.tsx` - Order loading
- `frontend/src/app/(admin)/admin/items/page.tsx` - Item management
- `frontend/src/app/orders/page.tsx` - Buyer orders

### 2. Dynamic Imports (Code Splitting)

Lazy load heavy components to reduce initial bundle size.

```tsx
// ✅ Good: Lazy load maps, modals, footers
const StaticMap = dynamic(() => import("@/components/maps/StaticMap"), {
  ssr: false, // Client-only components
});

const FooterSection = dynamic(() => import("@/components/home/FooterSection"), {
  ssr: false,
  loading: () => <div className="h-32" />, // Loading placeholder
});
```

**Real Use Cases:**

- `frontend/src/app/orders/page.tsx` - StaticMap (heavy map library)
- `frontend/src/app/marketplace/page.tsx` - FooterSection
- `frontend/src/components/Navbar.tsx` - NotificationBell

### 3. Server-Side Pagination

Fetch only the data needed for the current page.

```tsx
// ✅ Good: Server-side pagination pattern
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const itemsPerPage = 10;

const loadOrders = useCallback(async () => {
  const params = new URLSearchParams();
  params.set("page", String(currentPage));
  params.set("limit", String(itemsPerPage));

  const response = await fetch(`${API_BASE}/api/orders?${params.toString()}`);
  const data = await response.json();

  setOrders(data.orders || []);
  setTotalPages(data.pagination?.totalPages || 1);
}, [currentPage, itemsPerPage]);

useEffect(() => {
  loadOrders();
}, [loadOrders]);
```

**Benefits:**

- Reduced network payload (only 10-20 items per request)
- Faster initial page load
- Lower memory usage
- Better scalability

**Used in:** Admin (Users, Reports, Items, Shops), Seller (Orders, Items), Buyer (Orders, Reports)

### 4. Debouncing

Limit API calls for search inputs.

```tsx
import debounce from "lodash.debounce";

// ✅ Good: Debounce search (300ms delay)
const debouncedSearch = useMemo(() => {
  return debounce((val: string) => {
    updateURLParams({ search: val.trim() || null });
  }, 300); // Wait 300ms after user stops typing
}, [updateURLParams]);

// Cleanup on unmount
useEffect(() => {
  return () => debouncedSearch.cancel();
}, [debouncedSearch]);
```

**Real Use Case:** `frontend/src/app/marketplace/page.tsx` - Search input

### 5. Request Cancellation

Cancel in-flight requests when component unmounts or new requests are made.

```tsx
// ✅ Good: Cancel previous requests
const abortControllerRef = useRef<AbortController | null>(null);

const fetchItems = useCallback(async () => {
  // Cancel previous request
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }

  abortControllerRef.current = new AbortController();

  try {
    const res = await listItems(params, abortControllerRef.current.signal);
    // Handle response
  } catch (error) {
    if (error.name === "AbortError") return; // Ignore cancelled requests
    // Handle other errors
  }
}, [params]);

// Cleanup on unmount
useEffect(() => {
  return () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };
}, []);
```

**Real Use Case:** `frontend/src/app/marketplace/page.tsx` - Item fetching

### 6. Next.js Configuration Optimizations

**File:** `frontend/next.config.ts`

```typescript
const nextConfig: NextConfig = {
  // Image optimization (WebP/AVIF formats)
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },

  // Tree-shake unused exports
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "react-hot-toast",
    ],
    optimizeCss: true,
  },

  // Bundle splitting
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        moduleIds: "deterministic", // Better caching
        runtimeChunk: "single",
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              priority: 10,
            },
          },
        },
      };
    }
    return config;
  },

  compress: true, // Gzip compression
  poweredByHeader: false, // Security
  generateEtags: true, // Better caching
};
```

### 7. Prevent Hydration Errors

Conditionally render client-only content.

```tsx
// ✅ Good: Prevent hydration mismatch
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

// Only render after client-side mount
{
  mounted && <CartBadge count={cartCount} />;
}
```

**Real Use Case:** `frontend/src/components/Navbar.tsx` - CartBadge (uses localStorage)

---

## Backend Optimizations

### 1. Mongoose `.lean()` Queries

Return plain JavaScript objects instead of Mongoose documents for better performance.

```typescript
// ✅ Good: Use .lean() for read-only queries
const [total, orders] = await Promise.all([
  Order.countDocuments(filter),
  Order.find(filter)
    .skip(skip)
    .limit(limitNum)
    .lean() // Returns plain objects, not Mongoose documents
    .sort({ createdAt: -1 }),
]);

return res.json({
  success: true,
  orders,
  pagination: {
    currentPage: pageNum,
    totalPages: Math.ceil(total / limitNum),
    total,
  },
});
```

**Benefits:**

- Faster query execution (no Mongoose overhead)
- Lower memory usage
- Better for pagination and large datasets

**Used in:** All pagination endpoints (orders, items, users, reports, etc.)

### 2. Concurrent Database Operations

Execute multiple independent queries concurrently.

```typescript
// ✅ Good: Execute count and find concurrently
const [total, items] = await Promise.all([
  Item.countDocuments(filter),
  Item.find(filter).skip(skip).limit(limit).lean(),
]);

// ❌ Bad: Sequential execution (slower)
const total = await Item.countDocuments(filter);
const items = await Item.find(filter).skip(skip).limit(limit).lean();
```

**Performance Gain:** ~50% faster for pagination queries

### 3. Server-Side Pagination

Implement pagination at the database level.

```typescript
// ✅ Good: Server-side pagination pattern
const page = parseInt(req.query.page as string) || 1;
const limit = parseInt(req.query.limit as string) || 10;
const skip = (page - 1) * limit;

const filter: any = {};
if (req.query.status) {
  filter.status = req.query.status;
}

const [total, items] = await Promise.all([
  Item.countDocuments(filter),
  Item.find(filter)
    .skip(skip)
    .limit(limit)
    .lean()
    .select("title price photo status") // Select only needed fields
    .sort({ createdAt: -1 }),
]);

return res.json({
  success: true,
  items,
  pagination: {
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    total,
  },
});
```

**Endpoints:** All GET endpoints with pagination (orders, items, users, shops, reports, activity-logs)

### 4. Database Indexing

Create indexes on frequently queried fields.

```typescript
// Recommended indexes
OrderSchema.index({ buyer: 1, status: 1 });
OrderSchema.index({ seller: 1, status: 1 });
OrderSchema.index({ createdAt: -1 });

ItemSchema.index({ owner: 1, status: 1 });
ItemSchema.index({ category: 1, status: 1 });
ItemSchema.index({ title: "text", description: "text" }); // Text search

UserSchema.index({ email: 1 }, { unique: true });
ActivityLogSchema.index({ userId: 1, createdAt: -1 });
```

### 5. Selective Field Projection

Only fetch the fields you need.

```typescript
// ✅ Good: Select only needed fields
const user = await User.findById(userId).select("name email role").lean();

// ❌ Bad: Fetching all fields unnecessarily
const user = await User.findById(userId).lean();
```

---

## Best Practices

### 1. TypeScript Type Safety

Always use explicit types.

```typescript
// ✅ Good: Explicit types
interface OrderData {
  id: string;
  seller: { id: string; name?: string };
  items: OrderItem[];
  status: string;
  total: number;
}

const loadOrders = useCallback(async (): Promise<void> => {
  // Type-safe implementation
}, []);
```

### 2. Error Handling

Always handle errors gracefully.

```typescript
// ✅ Good: Comprehensive error handling
try {
  const data = await fetchOrders();
  setOrders(data);
} catch (error) {
  console.error("Failed to load orders:", error);
  toast.error(error instanceof Error ? error.message : "Failed to load orders");
  setOrders([]);
} finally {
  setLoading(false);
}
```

### 3. Loading States

Always show loading indicators.

```tsx
{
  loading ? (
    <div className="flex justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
    </div>
  ) : (
    <OrderList orders={orders} />
  );
}
```

---

## Complete Example: Optimized Component

```tsx
"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Lazy load heavy components
const ItemModal = dynamic(() => import("@/components/ItemModal"), {
  ssr: false,
});

// Memoize list item
const ListItem = memo(({ item, onSelect }: ListItemProps) => {
  return <div onClick={() => onSelect(item)}>{/* Content */}</div>;
});

export default function OptimizedList() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Memoize load function
  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", String(itemsPerPage));

      const response = await fetch(`/api/items?${params.toString()}`);
      const data = await response.json();

      setItems(data.items || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Failed to load items:", error);
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Memoize filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => item.status === "active");
  }, [items]);

  // Memoize event handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      {filteredItems.map((item) => (
        <ListItem key={item.id} item={item} onSelect={handlePageChange} />
      ))}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
```

---

## Performance Targets

- **First Contentful Paint (FCP):** < 1.8s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3.8s
- **Initial JavaScript bundle:** < 200KB (gzipped)
- **Total bundle size:** < 500KB (gzipped)

---

## Summary

**Frontend Techniques:**

- React memoization (memo, useMemo, useCallback)
- Dynamic imports and code splitting
- Server-side pagination
- Debouncing and request cancellation
- Next.js optimizations (image, bundle, CSS)

**Backend Techniques:**

- Mongoose `.lean()` queries
- Concurrent operations with `Promise.all()`
- Server-side pagination
- Database indexing
- Selective field projection

These techniques work together to ensure the application is fast, efficient, and scalable.
