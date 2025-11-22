"use client";

import { X, AlertTriangle } from "lucide-react";

interface DeleteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export default function DeleteReviewModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteReviewModalProps) {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Delete Review</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isDeleting}
              aria-label="Close"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Are you sure you want to delete this review?
                </p>
              </div>
            </div>
            <p className="text-sm text-red-600 font-medium">
              This action cannot be undone. Your review will be permanently removed.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Deleting...</span>
                </>
              ) : (
                "Delete Review"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

