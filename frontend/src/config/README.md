# Config Directory

This directory contains all API configuration and service functions for the frontend.

## Structure

```
config/
├── constants.ts       # App constants and API base URL
├── auth.ts           # Authentication API (signup, signin)
├── profile.ts        # User profile API
├── items.ts          # Items/products API
├── cart.ts           # Shopping cart API
├── verification.ts   # Identity verification API
├── notifications.ts  # Notifications API
└── index.ts          # Central export point
```

## Usage

### Import from central export

```typescript
import { API_BASE, signup, getProfile } from "@/config";
```

### Import specific module

```typescript
import { addToCart, getCart } from "@/config/cart";
```

## API Base URL

The API base URL is configured in `constants.ts`:

- **Development**: `http://localhost:5000`
- **Production**: Set via `NEXT_PUBLIC_API_BASE` environment variable

## Best Practices

1. **Types First**: All request/response types are defined at the top of each file
2. **Error Handling**: All API functions throw errors that should be caught by callers
3. **Consistent Pattern**: All API functions follow the same async/await pattern
4. **Type Safety**: Full TypeScript typing for all requests and responses

## Adding New API Endpoints

1. Create new file (e.g., `orders.ts`)
2. Define types
3. Create API functions
4. Export from `index.ts`

Example:

```typescript
// orders.ts
import { API_BASE } from "./constants";

export type Order = {
  id: string;
  total: number;
  status: string;
};

export async function getOrders(token: string): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/api/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}
```
