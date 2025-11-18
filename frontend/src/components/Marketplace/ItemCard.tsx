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
      text: "text-[#780606]",
      bg: "bg-[#780606]",
      border: "border-[#780606]",
      label: "Sold",
    },
  } as const;

  const statusStyle = statusConfig[status as keyof typeof statusConfig] || {
    text: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
    label: status,
  };

  const formattedPrice = Number.isFinite(price) ? price.toLocaleString() : "0";

  return (
    <div className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <Image
          src={photo || "/placeholder.png"}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          width={400}
          height={160}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute top-2 right-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text} border backdrop-blur-sm shadow-sm`}
          >
            {statusStyle.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col px-4 py-3">
        <h3 className="mb-1 line-clamp-2 min-h-[2.6rem] text-sm font-semibold text-gray-900 transition-colors duration-300 group-hover:text-[#69773D] sm:text-base">
          {title}
        </h3>
        <p className="flex-1 text-[11px] text-gray-600 line-clamp-2 min-h-[2.5rem] sm:text-xs">
          {description || "No description"}
        </p>

        {/* Rating section */}
        {rating !== undefined && rating > 0 ? (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-semibold text-gray-900 sm:text-sm">
                {rating.toFixed(1)}
              </span>
            </div>
            {totalReviews !== undefined && totalReviews > 0 && (
              <span className="text-[10px] text-gray-500 sm:text-xs">
                ({totalReviews})
              </span>
            )}
          </div>
        ) : (
          <p className="text-[10px] italic text-gray-500 sm:text-xs">
            No reviews yet
          </p>
        )}

        {/* Price section */}
        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-[#69773D] sm:text-lg">
              {formattedPrice}
            </span>
            <span className="text-[10px] font-medium text-gray-500 sm:text-xs">
              THB
            </span>
          </div>
          <div className="flex items-center gap-0.5 text-[9px] text-gray-400 transition-colors duration-300 group-hover:text-[#69773D] sm:gap-1 sm:text-[10px]">
            <span className="hidden font-medium sm:inline">View</span>
            <svg
              className="h-3 w-3 transform transition-transform duration-300 group-hover:translate-x-1"
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
