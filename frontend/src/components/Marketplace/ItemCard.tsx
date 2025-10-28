"use client";
import Image from "next/image";

interface ItemCardProps {
  id?: string;
  title: string;
  description?: string;
  price: number;
  photo?: string;
  status: "available" | "reserved" | "sold" | string;
}

export default function ItemCard({
  title,
  description,
  price,
  photo,
  status,
}: ItemCardProps) {
  const statusColorMap = {
    available: "text-green-600",
    reserved: "text-yellow-500",
    sold: "text-red-500",
  } as const;

  const statusClass =
    statusColorMap[status as keyof typeof statusColorMap] || "text-gray-500";

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition p-4 flex flex-col cursor-pointer">
      <Image
        src={photo || "/placeholder.png"}
        alt={title}
        className="w-full h-48 object-cover rounded-lg mb-3"
        width={400}
        height={192}
      />
      <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 line-clamp-2">
        {description || "No description"}
      </p>
      <div className="mt-auto flex justify-between items-center">
        <span className="font-bold text-green-700">{price} THB</span>
        <span className={`text-sm font-medium ${statusClass}`}>{status}</span>
      </div>
    </div>
  );
}
