import type { Item, ListItemsResponse } from "@/config/items";


export interface MockItemCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  photo: string;
  status: string;
}

export interface MockPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface MockListItemsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}


export type MockListItems = jest.MockedFunction<
  (params: MockListItemsParams, signal?: AbortSignal) => Promise<ListItemsResponse>
>;


export const createMockItem = (overrides: Partial<Item> = {}): Item => ({
  _id: "1",
  title: "Test Item",
  description: "Test description",
  price: 1000,
  photo: ["photo.jpg"],
  status: "available",
  category: "electronics",
  owner: "ownerId",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});


export const createMockResponse = (
  items: Item[],
  pagination: Partial<ListItemsResponse["data"]["pagination"]> = {}
): ListItemsResponse => ({
  success: true,
  data: {
    items,
    pagination: {
      totalItems: items.length,
      totalPages: 1,
      currentPage: 1,
      limit: 12,
      ...pagination,
    },
  },
});