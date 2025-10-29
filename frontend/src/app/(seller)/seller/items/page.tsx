"use client";

import { useEffect, useState } from "react";
import { Package, Edit, Trash2, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ItemData {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  status: "available" | "sold";
  image: string;
  createdAt: string;
}

export default function SellerItems() {
  const [items, setItems] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async (): Promise<void> => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authentication");
      if (!token) return;

      // TODO: API call
      setTimeout(() => {
        setItems([
          {
            id: "1",
            title: "Programming Textbook",
            description: "Introduction to Programming",
            price: 450,
            category: "Books",
            status: "available",
            image: "/placeholder.png",
            createdAt: new Date().toISOString(),
          },
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Failed to load items:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading items...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Items</h1>
          <p className="text-gray-600 mt-1">Manage your listed products</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadItems}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <Link
            href="/seller/add-item"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            + Add Item
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No items yet
          </h3>
          <p className="text-gray-600 mb-4">Start by adding your first item</p>
          <Link
            href="/seller/add-item"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Add Item
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="relative h-48 bg-gray-100">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-green-600">
                    ฿{item.price.toLocaleString()}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      item.status === "available"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    <Edit size={14} className="inline mr-1" />
                    Edit
                  </button>
                  <button className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                    <Trash2 size={14} className="inline mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
