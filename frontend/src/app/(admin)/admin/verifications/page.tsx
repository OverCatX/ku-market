"use client";

import { useEffect, useState, memo, useMemo } from "react";
import {
  getVerifications,
  approveVerification,
  rejectVerification,
  type Verification,
} from "@/config/admin";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Eye, RefreshCw } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ImagePreviewModal } from "@/components/admin/ImagePreviewModal";
import { SearchBar } from "@/components/admin/SearchBar";
import { Pagination } from "@/components/admin/Pagination";

interface TableRowProps {
  verification: Verification;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewImage: (url: string, title: string) => void;
  isLoading: boolean;
}

const TableRow = memo(function TableRow({
  verification,
  onApprove,
  onReject,
  onViewImage,
  isLoading,
}: TableRowProps) {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-6 py-4">
        <div>
          <div className="font-medium text-gray-900">
            {verification.user.name}
          </div>
          <div className="text-sm text-gray-500">{verification.user.email}</div>
          <div className="text-xs text-gray-400">
            {verification.user.faculty} | {verification.user.contact}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm">
          {verification.documentType.replace("_", " ").toUpperCase()}
        </span>
      </td>
      <td className="px-6 py-4">
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${
            verification.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : verification.status === "approved"
              ? "bg-green-100 text-green-800"
              : "bg-[#780606] text-[#780606]"
          }`}
        >
          {verification.status}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {new Date(verification.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onViewImage(
                verification.documentUrl,
                `Document - ${verification.user.name}`
              )
            }
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Document"
          >
            <Eye size={18} />
          </button>
          {verification.status === "pending" && (
            <>
              <button
                onClick={() => onApprove(verification.id)}
                disabled={isLoading}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                title="Approve"
              >
                <CheckCircle size={18} />
              </button>
              <button
                onClick={() => onReject(verification.id)}
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

export default function VerificationsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: "approve" | "reject" | null;
    id: string;
    name: string;
  }>({ isOpen: false, type: null, id: "", name: "" });
  const [rejectReason, setRejectReason] = useState("");
  const [imagePreview, setImagePreview] = useState<{
    isOpen: boolean;
    url: string;
    title: string;
  }>({ isOpen: false, url: "", title: "" });

  useEffect(() => {
    loadVerifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadVerifications = async (): Promise<void> => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      const data = await getVerifications(
        token,
        filter === "all" ? undefined : filter
      );
      setVerifications(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load verifications"
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter and search
  const filteredVerifications = useMemo(() => {
    return verifications.filter((v) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        v.user.name.toLowerCase().includes(searchLower) ||
        v.user.email.toLowerCase().includes(searchLower) ||
        v.user.faculty.toLowerCase().includes(searchLower)
      );
    });
  }, [verifications, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredVerifications.length / itemsPerPage);
  const paginatedVerifications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVerifications.slice(start, start + itemsPerPage);
  }, [filteredVerifications, currentPage, itemsPerPage]);

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
        await approveVerification(token, confirmDialog.id);
        toast.success("Verification approved");
      } else if (confirmDialog.type === "reject") {
        if (!rejectReason.trim()) {
          toast.error("Please provide a reason");
          return;
        }
        await rejectVerification(token, confirmDialog.id, rejectReason);
        toast.success("Verification rejected");
      }
      loadVerifications();
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Verifications
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Review and manage identity verification requests
          </p>
        </div>
        <button
          onClick={loadVerifications}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Filters */}
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

      {/* Search */}
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={(value) => {
            setSearchQuery(value);
            setCurrentPage(1);
          }}
          placeholder="Search by name, email, or faculty..."
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading verifications...</div>
          </div>
        ) : filteredVerifications.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            {searchQuery
              ? "No verifications match your search"
              : "No verifications found"}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Document Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedVerifications.map((v) => (
                    <TableRow
                      key={v.id}
                      verification={v}
                      onApprove={(id) => handleApproveClick(id, v.user.name)}
                      onReject={(id) => handleRejectClick(id, v.user.name)}
                      onViewImage={(url, title) =>
                        setImagePreview({ isOpen: true, url, title })
                      }
                      isLoading={actionLoading === v.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredVerifications.length}
                itemsPerPage={itemsPerPage}
              />
            )}
          </>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={
          confirmDialog.type === "approve"
            ? "Approve Verification?"
            : "Reject Verification?"
        }
        message={
          confirmDialog.type === "approve"
            ? `Are you sure you want to approve verification for ${confirmDialog.name}?`
            : `Are you sure you want to reject verification for ${confirmDialog.name}?`
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

      {/* Image Preview */}
      <ImagePreviewModal
        isOpen={imagePreview.isOpen}
        imageUrl={imagePreview.url}
        title={imagePreview.title}
        onClose={() => setImagePreview({ isOpen: false, url: "", title: "" })}
      />
    </div>
  );
}
