"use client";

import { useEffect, useState, useCallback, memo, useRef, useMemo } from "react";
import {
  Package,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  MessageSquare,
  Star,
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  getItems,
  approveItem,
  rejectItem,
  updateItem,
  deleteItem,
  getItemReviews,
  deleteReview,
  type ItemData,
  type UpdateItemData,
  type AdminReview,
} from "@/config/admin";
import RejectModal from "@/components/admin/RejectModal";
import EditItemModal from "@/components/admin/EditItemModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import { Pagination } from "@/components/admin/Pagination";

type ApprovalStatus = "pending" | "approved" | "rejected";

interface StatusBadgeProps {
  status: ApprovalStatus;
}

const StatusBadge = memo(function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    pending: {
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Clock,
      label: "Pending",
    },
    approved: {
      className: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle,
      label: "Approved",
    },
    rejected: {
      className: "bg-red-100 text-red-800 border-red-200",
      icon: XCircle,
      label: "Rejected",
    },
  };

  const { className, icon: Icon, label } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${className}`}
    >
      <Icon size={14} />
      {label}
    </span>
  );
});

interface ItemCardProps {
  item: ItemData;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason?: string) => Promise<void>;
  onEdit: (id: string, data: UpdateItemData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const ItemCard = memo(function ItemCard({
  item,
  onApprove,
  onReject,
  onEdit,
  onDelete,
}: ItemCardProps) {
  const [processing, setProcessing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleApprove = async () => {
    if (processing) return;
    setProcessing(true);
    try {
      await onApprove(item.id);
      toast.success(`Item "${item.title}" approved successfully`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to approve item"
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (processing) return;
    setProcessing(true);
    try {
      await onReject(item.id, reason || undefined);
      toast.success(`Item "${item.title}" rejected`);
      setShowRejectModal(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reject item"
      );
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  const openImageModal = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  const nextImage = useCallback(() => {
    if (!item.photo || item.photo.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % item.photo.length);
  }, [item.photo]);

  const prevImage = useCallback(() => {
    if (!item.photo || item.photo.length === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + item.photo.length) % item.photo.length);
  }, [item.photo]);

  useEffect(() => {
    if (!showImageModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowImageModal(false);
      } else if (e.key === "ArrowLeft" && item.photo.length > 1) {
        prevImage();
      } else if (e.key === "ArrowRight" && item.photo.length > 1) {
        nextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showImageModal, item.photo.length, prevImage, nextImage]);

  const formatDate = (dateString: string | undefined): string => {
    try {
      if (!dateString) {
        console.warn("formatDate: No dateString provided");
        return "N/A";
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn("formatDate: Invalid date", dateString);
        return "Invalid date";
      }
      return new Intl.DateTimeFormat("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      console.error("formatDate error:", error, dateString);
      return "Invalid date";
    }
  };

  const handleDeleteConfirm = async () => {
    if (processing) return;
    setProcessing(true);
    try {
      await onDelete(item.id);
      toast.success(`Item "${item.title}" deleted successfully`);
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete item"
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleEditSubmit = async (data: UpdateItemData) => {
    if (processing) return;
    setProcessing(true);
    try {
      await onEdit(item.id, data);
      toast.success(`Item "${item.title}" updated successfully`);
      setShowEditModal(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update item"
      );
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="relative h-48 bg-gray-100 cursor-pointer group" onClick={() => item.photo && item.photo.length > 0 && openImageModal(0)}>
          {item.photo && item.photo.length > 0 ? (
            <>
              <Image
                src={item.photo[0]}
                alt={item.title}
                fill
                className="object-cover group-hover:opacity-90 transition-opacity"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {item.photo.length > 1 && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  +{item.photo.length - 1} more
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Package size={48} />
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-gray-900 flex-1 text-sm">{item.title}</h3>
            <StatusBadge status={item.approvalStatus} />
          </div>
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">{item.description}</p>
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-bold text-green-600">
              ฿{item.price.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500">{item.category}</span>
          </div>
          <div className="border-t pt-3 space-y-2">
            <div className="text-xs text-gray-600">
              <p>
                <span className="font-medium">Seller:</span> {item.owner.name}
              </p>
              <p>
                <span className="font-medium">Email:</span> {item.owner.email}
              </p>
              <p>
                <span className="font-medium">Status:</span> {item.status}
              </p>
              <p>
                <span className="font-medium">Created:</span>{" "}
                {formatDate(item.createdAt)}
              </p>
              {item.rejectionReason && (
                <p className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                  <span className="font-medium">Rejection Reason:</span> {item.rejectionReason}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              {showDetails ? "Hide" : "Show"} Details{" "}
              <Eye size={12} className="inline ml-1" />
            </button>
            {showDetails && (
              <div className="text-xs text-gray-600 space-y-1 pt-2 border-t">
                <p className="font-medium">Full Description:</p>
                <p className="text-gray-700">{item.description}</p>
                {item.photo && item.photo.length > 1 && (
                  <div className="mt-2">
                    <p className="font-medium mb-1">All Images ({item.photo.length}):</p>
                    <div className="grid grid-cols-2 gap-2">
                      {item.photo.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative h-20 bg-gray-100 rounded cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => openImageModal(idx)}
                        >
                          <Image
                            src={url}
                            alt={`${item.title} ${idx + 1}`}
                            fill
                            className="object-cover rounded"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-3 pt-3 border-t">
            <button
              onClick={async () => {
                setShowReviewsModal(true);
                setLoadingReviews(true);
                try {
                  const token = localStorage.getItem("token");
                  if (!token) {
                    toast.error("Please login first");
                    return;
                  }
                  const itemReviews = await getItemReviews(token, item.id);
                  setReviews(itemReviews);
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : "Failed to load reviews"
                  );
                  setReviews([]);
                } finally {
                  setLoadingReviews(false);
                }
              }}
              className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium flex items-center justify-center gap-1"
            >
              <MessageSquare size={14} />
              Reviews
            </button>
            {item.approvalStatus === "pending" && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={processing}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  <CheckCircle size={14} className="inline mr-1" />
                  Approve
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={processing}
                  className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  <XCircle size={14} className="inline mr-1" />
                  Reject
                </button>
              </>
            )}
            <button
              onClick={() => setShowEditModal(true)}
              disabled={processing}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              title="Edit item"
            >
              <Edit size={14} className="inline" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={processing}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              title="Delete item"
            >
              <Trash2 size={14} className="inline" />
            </button>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleRejectConfirm}
        itemTitle={item.title}
      />

      {/* Edit Modal */}
      {showEditModal && (
        <EditItemModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditSubmit}
          item={item}
        />
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteConfirm}
          itemTitle={item.title}
          processing={processing}
        />
      )}

      {/* Image Gallery Modal */}
      {showImageModal && item.photo && item.photo.length > 0 && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md backdrop-saturate-150"
          onClick={() => setShowImageModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery"
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-colors"
              aria-label="Close gallery"
            >
              <X size={24} />
            </button>
            {item.photo.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
            <div className="relative w-full h-[80vh] bg-gray-900 rounded-lg overflow-hidden">
              <Image
                src={item.photo[currentImageIndex]}
                alt={`${item.title} ${currentImageIndex + 1}`}
                fill
                className="object-contain"
                sizes="90vw"
                priority
              />
            </div>
            {item.photo.length > 1 && (
              <div className="mt-4 text-center text-white">
                <p className="text-sm font-medium">
                  Image {currentImageIndex + 1} of {item.photo.length}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Use arrow keys or buttons to navigate
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reviews Modal */}
      {showReviewsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Reviews for &quot;{item.title}&quot;
              </h2>
              <button
                onClick={() => {
                  setShowReviewsModal(false);
                  setReviews([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {loadingReviews ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className={
                                    i < review.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300"
                                  }
                                />
                              ))}
                            </div>
                            {review.verified && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          {review.title && (
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {review.title}
                            </h4>
                          )}
                          <p className="text-sm text-gray-700 mb-3">{review.comment}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>
                              <span className="font-medium">By:</span> {review.userName}
                            </span>
                            <span>
                              <span className="font-medium">Email:</span> {review.userEmail}
                            </span>
                            <span>
                              <span className="font-medium">Helpful:</span> {review.helpful}
                            </span>
                            <span>
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            if (
                              !confirm(
                                "Are you sure you want to delete this review? This action cannot be undone."
                              )
                            ) {
                              return;
                            }
                            try {
                              const token = localStorage.getItem("token");
                              if (!token) {
                                toast.error("Please login first");
                                return;
                              }
                              await deleteReview(token, review.id);
                              toast.success("Review deleted successfully");
                              setReviews((prev) => prev.filter((r) => r.id !== review.id));
                            } catch (error) {
                              toast.error(
                                error instanceof Error
                                  ? error.message
                                  : "Failed to delete review"
                              );
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
                          title="Delete review"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default function ItemsPage() {
  const [items, setItems] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ApprovalStatus | "all">("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first");
        setLoading(false);
        return;
      }

      const approvalStatus =
        filter === "all" ? undefined : (filter as ApprovalStatus);
      const data = await getItems(token, approvalStatus, currentPage, itemsPerPage);
      setItems(data.items);
      setTotalPages(data.pagination.totalPages);
      setTotalItems(data.pagination.total);
    } catch (error) {
      console.error("Failed to load items:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load items"
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage, itemsPerPage]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleApprove = useCallback(
    async (id: string) => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first");
        return;
      }
      await approveItem(token, id);
      await loadItems();
    },
    [loadItems]
  );

  const handleReject = useCallback(
    async (id: string, reason?: string) => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first");
        return;
      }
      await rejectItem(token, id, reason);
      await loadItems();
    },
    [loadItems]
  );

  const handleEdit = useCallback(
    async (id: string, data: UpdateItemData) => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first");
        return;
      }
      await updateItem(token, id, data);
      await loadItems();
    },
    [loadItems]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first");
        return;
      }
      await deleteItem(token, id);
      await loadItems();
    },
    [loadItems]
  );

  // Counts are now calculated from total items, not current page items
  // We'll need to fetch counts separately or calculate from totalItems
  // For now, we'll show counts based on current page items (can be improved with separate count endpoint)
  const pendingCount = useMemo(() => items.filter((i) => i.approvalStatus === "pending").length, [items]);
  const approvedCount = useMemo(() => items.filter((i) => i.approvalStatus === "approved").length, [items]);
  const rejectedCount = useMemo(() => items.filter((i) => i.approvalStatus === "rejected").length, [items]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Item Management
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Manage all items in the marketplace - approve, reject, edit, or delete
          </p>
        </div>
        <button
          onClick={loadItems}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { value: "pending", label: "Pending", count: pendingCount },
          { value: "approved", label: "Approved", count: approvedCount },
          { value: "rejected", label: "Rejected", count: rejectedCount },
          { value: "all", label: "All", count: items.length },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setFilter(f.value as ApprovalStatus | "all");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f.value
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            {f.label}
            {f.value === "all" && (
              <span className="ml-2 text-xs">({totalItems})</span>
            )}
            {f.value !== "all" && (
              <span className="ml-2 text-xs">({f.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Items List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading items...</div>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No items found
          </h3>
          <p className="text-gray-600">
            {filter === "all"
              ? "No items have been submitted yet"
              : `No ${filter} items`}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onApprove={handleApprove}
                onReject={handleReject}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
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

