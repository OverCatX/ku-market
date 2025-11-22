"use client";

import { memo } from "react";
import { X, AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  itemTitle: string;
  processing: boolean;
}

const DeleteConfirmModal = memo(function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  itemTitle,
  processing,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Delete Item</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={processing}
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[#780606] rounded-full">
                <AlertTriangle className="text-[#780606]" size={24} />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Are you sure you want to delete this item?
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-2">
              Item: <span className="font-semibold">{itemTitle}</span>
            </p>
            <p className="text-sm text-[#780606] font-medium">
              This action cannot be undone. The item will be permanently removed
              from the marketplace.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={processing}
              className="flex-1 px-4 py-2 bg-[#780606] text-white rounded-lg hover:bg-[#780606] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {processing ? "Deleting..." : "Delete Item"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DeleteConfirmModal;

