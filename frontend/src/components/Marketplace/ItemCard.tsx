import React from "react";
import Image from "next/image";

interface ItemCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  photo: string;
  status: string;
}

export default function ItemCard({
  id,
  title,
  description,
  price,
  photo,
  status,
}: ItemCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition p-4 flex flex-col">
      <Image
        src={photo}
        alt={title}
        className="w-full h-48 object-cover rounded-lg mb-3"
      />
      <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
      <div className="mt-auto flex justify-between items-center">
        <span className="font-bold text-green-700">{price} THB</span>
        <span
          className={`text-sm font-medium ${
            status === "available"
              ? "text-green-600"
              : status === "reserved"
              ? "text-yellow-500"
              : "text-red-500"
          }`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}
