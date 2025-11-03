"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Upload, X, ArrowLeft } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { API_BASE } from "@/config/constants";
import { getCategories, Category } from "@/config/categories";
import Link from "next/link";

interface ItemData {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  status: "available" | "reserved" | "sold";
  approvalStatus: "pending" | "approved" | "rejected";
  photo: string[];
}

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params?.id as string;

  const [item, setItem] = useState<ItemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<Set<number>>(new Set());

  useEffect(() => {
    getCategories()
      .then((cats) => {
        setCategories(cats);
      })
      .catch((error) => {
        console.error("Failed to load categories:", error);
        toast.error("Failed to load categories");
      });
  }, []);

  const canEdit = useMemo(() => item?.approvalStatus === "approved", [item]);

  const loadItem = useCallback(async () => {
    if (!itemId) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("authentication");
      if (!token) {
        toast.error("Please login first");
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_BASE}/api/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to load item");
      }

      const data = await response.json();
      const itemData = data.item as ItemData;
      
      if (itemData.approvalStatus !== "approved") {
        toast.error("You can only edit approved items");
        router.push("/seller/items");
        return;
      }

      setItem(itemData);
      setTitle(itemData.title);
      setDescription(itemData.description);
      setPrice(itemData.price.toString());
      setCategory(itemData.category as Category);
      setExistingImages(itemData.photo || []);
    } catch (error) {
      console.error("Load error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load item");
      router.push("/seller/items");
    } finally {
      setLoading(false);
    }
  }, [itemId, router]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const filesArray = Array.from(files);
    const validImages = filesArray.filter((f) => f.type.startsWith("image/"));
    const remainingSlots = 5 - (existingImages.length - removedImages.size) - newImages.length;
    const toAdd = validImages.slice(0, Math.min(remainingSlots, 5));
    
    setNewImages((prev) => [...prev, ...toAdd]);
  }, [existingImages.length, removedImages.size]);

  const removeExistingImage = useCallback((index: number) => {
    setRemovedImages((prev) => new Set(prev).add(index));
  }, []);

  const removeNewImage = useCallback((index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const restoreImage = useCallback((index: number) => {
    setRemovedImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  }, []);

  const totalImages = useMemo(() => {
    return existingImages.length - removedImages.size + newImages.length;
  }, [existingImages.length, removedImages.size, newImages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canEdit) {
      toast.error("You can only edit approved items");
      return;
    }

    if (!title || !description || !price) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (totalImages === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("authentication");
      if (!token) {
        toast.error("Please login first");
        router.push("/login");
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);

      newImages.forEach((img) => {
        formData.append("photos", img);
      });

      const response = await fetch(`${API_BASE}/api/items/update/${itemId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || "Failed to update item";
        throw new Error(errorMessage);
      }

      toast.success("Item updated successfully!");
      router.push("/seller/items");
    } catch (error) {
      console.error("Update error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update item"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading item...</div>
      </div>
    );
  }

  if (!item || !canEdit) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Cannot Edit Item
          </h2>
          <p className="text-gray-600 mb-4">
            You can only edit items that have been approved by admin.
          </p>
          <Link
            href="/seller/items"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Items
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          href="/seller/items"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Items
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Item</h1>
        <p className="text-gray-600 mt-2">Update your item details</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm p-6 md:p-8 space-y-6"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g., Programming Textbook"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            rows={4}
            placeholder="Describe your item..."
            required
          />
        </div>

        {/* Price & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (฿) *
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={categories.length === 0}
            >
              {categories.length === 0 ? (
                <option value="">Loading categories...</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images * (Max 5, Current: {totalImages})
          </label>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-2">Current Images:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {existingImages.map((url, index) => {
                  const isRemoved = removedImages.has(index);
                  return (
                    <div
                      key={index}
                      className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                        isRemoved ? "opacity-50 border-red-300" : "border-transparent"
                      }`}
                    >
                      <Image
                        src={url}
                        alt={`Current ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                      />
                      {isRemoved ? (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => restoreImage(index)}
                            className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                          >
                            Restore
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* New Images */}
          {newImages.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-2">New Images:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {newImages.map((img, index) => (
                  <div
                    key={index}
                    className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
                  >
                    <Image
                      src={URL.createObjectURL(img)}
                      alt={`New ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          {totalImages < 5 && (
            <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors">
              <Upload size={32} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">
                Click to add more images ({5 - totalImages} remaining)
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !canEdit}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {submitting ? "Updating..." : "Update Item"}
          </button>
        </div>
      </form>
    </div>
  );
}

