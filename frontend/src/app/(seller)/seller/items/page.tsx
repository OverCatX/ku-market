"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Package,
  Edit,
  Trash2,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { API_BASE } from "@/config/constants";
import toast from "react-hot-toast";
import { Pagination } from "@/components/admin/Pagination";

interface ItemData {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  status: "available" | "reserved" | "sold";
  approvalStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  photo: string[];
  createdAt: string;
  updatedAt: string;
}

export default function SellerItems() {
  const [items, setItems] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 12;

  const loadItems = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authentication");
      if (!token) {
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", String(itemsPerPage));

      const response = await fetch(`${API_BASE}/api/seller/items?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to load items");
      }

      const data = await response.json();
      setItems(data.items || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalItems(data.pagination?.total || 0);
    } catch (error) {
      console.error("Failed to load items:", error);
      toast.error("Failed to load items");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleStatusChange = async (
    itemId: string,
    newStatus: ItemData["status"]
  ) => {
    setUpdatingStatusId(itemId);
    try {
      const token = localStorage.getItem("authentication");
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const response = await fetch(
        `${API_BASE}/api/seller/items/${itemId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message =
          (payload as { error?: string }).error ||
          "Failed to update item status";
        throw new Error(message);
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, status: newStatus } : item
        )
      );
      toast.success("Item status updated");
    } catch (error) {
      console.error("Failed to update item status:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update item status"
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };


  if (loading) {
    return <div className="text-center py-12">Loading items...</div>;
  }

  return (
    <div style={{ backgroundColor: '#F6F2E5', minHeight: '100vh', padding: '2rem' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-[#4A5130] tracking-tight">My Items</h1>
          <p className="text-[#69773D] mt-2 font-medium text-base">Manage your listed products</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadItems}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white text-[#4A5130] rounded-lg hover:bg-gray-50 hover:text-[#4A5130] disabled:opacity-50 transition-colors border border-gray-200 font-semibold"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <Link
            href="/seller/add-item"
            className="px-5 py-2.5 bg-[#5C8140] text-white rounded-lg hover:bg-[#4a6b33] transition-all font-bold shadow-md hover:shadow-lg"
          >
            + Add Item
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Package size={48} className="mx-auto text-[#8c522f] mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No items yet
          </h3>
          <p className="text-[#8c522f] mb-4">Start by adding your first item</p>
          <Link
            href="/seller/add-item"
            className="inline-block px-6 py-3 bg-[#69773D] text-[#F6F2E5] rounded-lg hover:bg-[#5a6530] transition-colors font-medium"
          >
            Add Item
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="relative h-48 bg-gray-100">
                {item.photo && item.photo.length > 0 ? (
                  <Image
                    src={item.photo[0]}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package size={48} />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-extrabold text-[#4A5130] flex-1 text-base md:text-lg">
                    {item.title}
                  </h3>
                  <span
                    className={`text-xs px-3 py-1.5 rounded-full ml-2 flex items-center gap-1.5 whitespace-nowrap font-bold shadow-sm ${
                      item.approvalStatus === "approved"
                        ? "bg-[#5C8140]/20 text-[#5C8140] border-2 border-[#5C8140]/40"
                        : item.approvalStatus === "pending"
                        ? "bg-yellow-100 text-yellow-900 border-2 border-yellow-400"
                        : "bg-red-100 text-red-900 border-2 border-red-400"
                    }`}
                    title={
                      item.approvalStatus === "pending"
                        ? "Waiting for admin approval"
                        : item.approvalStatus === "approved"
                        ? "Approved and published"
                        : "Rejected by admin"
                    }
                  >
                    {item.approvalStatus === "pending" && <Clock size={12} />}
                    {item.approvalStatus === "approved" && (
                      <CheckCircle size={12} />
                    )}
                    {item.approvalStatus === "rejected" && (
                      <XCircle size={12} />
                    )}
                    {item.approvalStatus}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  Added:{" "}
                  {(() => {
                    if (!item.createdAt) return "N/A";
                    try {
                      const date = new Date(item.createdAt);
                      if (isNaN(date.getTime())) {
                        return "Invalid date";
                      }
                      return new Intl.DateTimeFormat("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(date);
                    } catch (error) {
                      console.error(
                        "Date formatting error:",
                        error,
                        item.createdAt
                      );
                      return "Invalid date";
                    }
                  })()}
                </div>
                {item.approvalStatus === "rejected" && item.rejectionReason && (
                  <div className="mb-2 p-2 bg-[#780606] border border-[#780606] rounded text-xs text-[#780606]">
                    <p className="font-medium mb-1">Rejection Reason:</p>
                    <p className="text-[#780606]">{item.rejectionReason}</p>
                  </div>
                )}
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
                  <span className="text-lg font-bold text-[#4A5130]">
                    ฿{item.price.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 hidden sm:block">
                      Status:
                    </label>
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(
                          item.id,
                          e.target.value as ItemData["status"]
                        )
                      }
                      disabled={updatingStatusId === item.id}
                      className="text-xs px-2 py-1 rounded-lg border border-[#69773D] focus:outline-none focus:ring-1 focus:ring-[#69773D]"
                    >
                      <option value="available">available</option>
                      <option value="reserved">reserved</option>
                      <option value="sold">sold</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/seller/edit-item/${item.id}`}
                    className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium text-center ${
                      item.approvalStatus === "approved"
                        ? "bg-[#69773D] text-white hover:bg-[#5a6530]"
                        : "bg-gray-400 text-white cursor-not-allowed opacity-50"
                    }`}
                    onClick={(e) => {
                      if (item.approvalStatus !== "approved") {
                        e.preventDefault();
                        toast.error("You can only edit approved items");
                      }
                    }}
                  >
                    <Edit size={14} className="inline mr-1" />
                    Edit
                  </Link>
                  <button
                    onClick={async () => {
                      if (
                        !confirm(
                          `Are you sure you want to delete "${item.title}"?`
                        )
                      ) {
                        return;
                      }
                      try {
                        const token = localStorage.getItem("authentication");
                        if (!token) {
                          toast.error("Please login first");
                          return;
                        }
                        const response = await fetch(
                          `${API_BASE}/api/items/delete/${item.id}`,
                          {
                            method: "DELETE",
                            headers: { Authorization: `Bearer ${token}` },
                          }
                        );
                        if (!response.ok) {
                          throw new Error("Failed to delete item");
                        }
                        toast.success("Item deleted successfully");
                        await loadItems();
                      } catch (error) {
                        console.error("Delete error:", error);
                        toast.error(
                          error instanceof Error
                            ? error.message
                            : "Failed to delete item"
                        );
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-[#780606] text-white rounded-lg hover:bg-[#8c522f] transition-colors text-sm font-medium"
                  >
                    <Trash2 size={14} className="inline mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
            ))}
          </div>
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            )}
        </>
      )}
    </div>
  );
}
