"use client";

import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "primary";
  children?: React.ReactNode;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "primary",
  children,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: "bg-[#780606] hover:bg-[#5c0505]",
    warning: "bg-[#780606] hover:bg-[#5c0505]",
    primary: "bg-[#69773D] hover:bg-[#5a6530]",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className={`flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
          variant === "danger" || variant === "warning" 
            ? "bg-[#780606]/10" 
            : "bg-[#4A5130]/10"
        }`}>
          <AlertTriangle className={
            variant === "danger" || variant === "warning" 
              ? "text-[#780606]" 
              : "text-[#4A5130]"
          } size={24} />
        </div>

        {/* Content */}
        <h3 className={`text-xl font-bold mb-2 ${
          variant === "danger" || variant === "warning" 
            ? "text-[#780606]" 
            : "text-[#4A5130]"
        }`}>{title}</h3>
        <p className={`mb-4 ${
          variant === "danger" || variant === "warning" 
            ? "text-[#780606]/60" 
            : "text-[#69773D]"
        }`}>{message}</p>

        {/* Additional Content */}
        {children}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg text-[#F6F2E5] transition-colors ${variantStyles[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
