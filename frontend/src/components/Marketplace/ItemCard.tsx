"use client";
import Image from "next/image";
import { Star } from "lucide-react";

interface ItemCardProps {
  id?: string;
  title: string;
  description?: string;
  price: number;
  photo?: string;
  status: "available" | "reserved" | "sold" | string;
  rating?: number; // Average rating (0-5)
  totalReviews?: number; // Total number of reviews
}

export default function ItemCard({
  title,
  description,
  price,
  photo,
  status,
  rating,
  totalReviews,
}: ItemCardProps) {
  const statusConfig = {
    available: {
      text: "text-[#69773D]",
      bg: "bg-green-50",
      border: "border-green-200",
      label: "Available",
    },
    reserved: {
      text: "text-yellow-700",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      label: "Reserved",
    },
    sold: {
      text: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
      label: "Sold",
    },
  } as const;

  const statusStyle =
    statusConfig[status as keyof typeof statusConfig] || {
      text: "text-gray-600",
      bg: "bg-gray-50",
      border: "border-gray-200",
      label: status,
    };

  return (
    <div className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-3 sm:p-4 flex flex-col cursor-pointer overflow-hidden relative w-full max-w-[280px] sm:max-w-[260px] md:max-w-[280px] lg:max-w-[300px] mx-auto">
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#69773D]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Image container with gradient overlay on hover */}
      <div className="relative w-full h-32 sm:h-36 md:h-40 mb-2 sm:mb-3 rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={photo || "/placeholder.png"}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          width={400}
          height={160}
        />
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Status badge */}
        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
          <span
            className={`inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text} border backdrop-blur-sm shadow-sm`}
          >
            {statusStyle.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">
        <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 sm:mb-1.5 line-clamp-2 group-hover:text-[#69773D] transition-colors duration-300">
          {title}
        </h3>
        <p className="text-[11px] sm:text-xs text-gray-600 line-clamp-2 mb-2 sm:mb-3 flex-1">
          {description || "No description"}
        </p>

        {/* Rating section */}
        {rating !== undefined && rating > 0 && (
          <div className="flex items-center gap-1.5 mb-2 sm:mb-2.5">
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs sm:text-sm font-semibold text-gray-900">
                {rating.toFixed(1)}
              </span>
            </div>
            {totalReviews !== undefined && totalReviews > 0 && (
              <span className="text-[10px] sm:text-xs text-gray-500">
                ({totalReviews})
              </span>
            )}
          </div>
        )}

        {/* Price section */}
        <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-gray-100">
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-bold text-[#69773D]">
              {price.toLocaleString()}
            </span>
            <span className="text-[10px] sm:text-xs text-gray-500 font-medium">THB</span>
          </div>
          {/* View details indicator */}
          <div className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] text-gray-400 group-hover:text-[#69773D] transition-colors duration-300">
            <span className="font-medium hidden sm:inline">View</span>
            <svg
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 transform group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Shine effect on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </div>
  );
}
