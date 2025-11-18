"use client";

import { useEffect, useState, memo, useMemo } from "react";
import {
  getShops,
  approveShop,
  rejectShop,
  type ShopRequest,
} from "@/config/admin";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import Image from "next/image";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { SearchBar } from "@/components/admin/SearchBar";
import { Pagination } from "@/components/admin/Pagination";

interface TableRowProps {
  shop: ShopRequest;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isLoading: boolean;
}

const TableRow = memo(function TableRow({
  shop,
  onApprove,
  onReject,
  isLoading,
}: TableRowProps) {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {shop.shopPhoto && (
            <Image
              src={shop.shopPhoto}
              alt={shop.shopName}
              width={48}
              height={48}
              className="rounded-lg object-cover"
            />
          )}
          <div>
            <div className="font-medium text-gray-900">{shop.shopName}</div>
            <div className="text-xs text-gray-500">
              {shop.productCategory.join(", ")}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {shop.owner.name}
          </div>
          <div className="text-xs text-gray-500">{shop.owner.email}</div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">{shop.shopType}</td>
      <td className="px-6 py-4">
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${
            shop.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : shop.status === "approved"
              ? "bg-green-100 text-green-800"
              : "bg-[#780606] text-[#780606]"
          }`}
        >
          {shop.status}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {new Date(shop.requestDate).toLocaleDateString()}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {shop.status === "pending" && (
            <>
              <button
                onClick={() => onApprove(shop.id)}
                disabled={isLoading}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                title="Approve"
              >
                <CheckCircle size={18} />
              </button>
              <button
                onClick={() => onReject(shop.id)}
                disabled={isLoading}
                className="p-2 text-[#780606] hover:bg-[#780606] rounded-lg transition-colors disabled:opacity-50"
                title="Reject"
              >
                <XCircle size={18} />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
});

export default function ShopsPage() {
  const [shops, setShops] = useState<ShopRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: "approve" | "reject" | null;
    id: string;
    name: string;
  }>({ isOpen: false, type: null, id: "", name: "" });
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    loadShops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadShops = async (): Promise<void> => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      const data = await getShops(token, filter === "all" ? undefined : filter);
      setShops(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load shops"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = useMemo(() => {
    return shops.filter((s) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        s.shopName.toLowerCase().includes(searchLower) ||
        s.owner.name.toLowerCase().includes(searchLower) ||
        s.owner.email.toLowerCase().includes(searchLower)
      );
    });
  }, [shops, searchQuery]);

  const totalPages = Math.ceil(filteredShops.length / itemsPerPage);
  const paginatedShops = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredShops.slice(start, start + itemsPerPage);
  }, [filteredShops, currentPage, itemsPerPage]);

  const handleApproveClick = (id: string, name: string) => {
    setConfirmDialog({ isOpen: true, type: "approve", id, name });
  };

  const handleRejectClick = (id: string, name: string) => {
    setConfirmDialog({ isOpen: true, type: "reject", id, name });
    setRejectReason("");
  };

  const handleConfirmAction = async () => {
    const token = localStorage.getItem("token");
    if (!token || !confirmDialog.id) return;

    setActionLoading(confirmDialog.id);
    try {
      if (confirmDialog.type === "approve") {
        await approveShop(token, confirmDialog.id);
        toast.success("Shop approved");
      } else if (confirmDialog.type === "reject") {
        if (!rejectReason.trim()) {
          toast.error("Please provide a reason");
          return;
        }
        await rejectShop(token, confirmDialog.id, rejectReason);
        toast.success("Shop rejected");
      }
      loadShops();
      setConfirmDialog({ isOpen: false, type: null, id: "", name: "" });
      setRejectReason("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Shop Requests
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Review and manage new shop applications
          </p>
        </div>
        <button
          onClick={loadShops}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(["all", "pending", "approved", "rejected"] as const).map((status) => (
          <button
            key={status}
            onClick={() => {
              setFilter(status);
              setCurrentPage(1);
            }}
            className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-colors ${
              filter === status
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={(value) => {
            setSearchQuery(value);
            setCurrentPage(1);
          }}
          placeholder="Search by shop name or owner..."
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading shop requests...</div>
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            {searchQuery
              ? "No shops match your search"
              : "No shop requests found"}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Shop
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Requested
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedShops.map((shop) => (
                    <TableRow
                      key={shop.id}
                      shop={shop}
                      onApprove={(id) => handleApproveClick(id, shop.shopName)}
                      onReject={(id) => handleRejectClick(id, shop.shopName)}
                      isLoading={actionLoading === shop.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredShops.length}
                itemsPerPage={itemsPerPage}
              />
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={
          confirmDialog.type === "approve" ? "Approve Shop?" : "Reject Shop?"
        }
        message={
          confirmDialog.type === "approve"
            ? `Are you sure you want to approve "${confirmDialog.name}"?`
            : `Are you sure you want to reject "${confirmDialog.name}"?`
        }
        confirmText={confirmDialog.type === "approve" ? "Approve" : "Reject"}
        variant={confirmDialog.type === "reject" ? "danger" : "primary"}
        onConfirm={handleConfirmAction}
        onCancel={() =>
          setConfirmDialog({ isOpen: false, type: null, id: "", name: "" })
        }
      >
        {confirmDialog.type === "reject" && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for rejection *
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Please provide a reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
