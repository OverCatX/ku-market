"use client";

import { X, ZoomIn, ZoomOut, Download } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface ImagePreviewModalProps {
  isOpen: boolean;
  imageUrl: string;
  title?: string;
  onClose: () => void;
}

export function ImagePreviewModal({
  isOpen,
  imageUrl,
  title,
  onClose,
}: ImagePreviewModalProps): JSX.Element | null {
  const [zoom, setZoom] = useState(100);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleDownload = () => window.open(imageUrl, "_blank");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-black bg-opacity-50">
        <h3 className="text-white font-semibold">{title || "Image Preview"}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
          <span className="text-white text-sm">{zoom}%</span>
          <button
            onClick={handleZoomIn}
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            title="Download"
          >
            <Download size={20} />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Image */}
      <div
        className="relative max-w-7xl max-h-[90vh] overflow-auto"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "center",
          }}
          className="transition-transform"
        >
          <img
            src={imageUrl}
            alt={title || "Preview"}
            className="max-w-full h-auto"
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm opacity-70">
        Click outside image to close
      </div>
    </div>
  );
}
