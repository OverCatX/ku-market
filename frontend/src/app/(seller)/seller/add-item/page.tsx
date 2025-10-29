"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { API_BASE } from "@/config/constants";

type Category = "Electronics" | "Books" | "Fashion" | "Dorm" | "Other";

export default function AddItemPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<Category>("Other");
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: File[] = [];
    for (let i = 0; i < Math.min(files.length, 3); i++) {
      if (files[i].type.startsWith("image/")) {
        newImages.push(files[i]);
      }
    }
    setImages(newImages);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !price) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (images.length === 0) {
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

      images.forEach((img) => {
        formData.append("photos", img);
      });

      const response = await fetch(`${API_BASE}/api/items/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload item");
      }

      toast.success("Item added successfully!");
      router.push("/seller/items");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add item"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Item</h1>
        <p className="text-gray-600 mt-2">List a new product for sale</p>
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
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="Electronics">Electronics</option>
              <option value="Books">Books</option>
              <option value="Fashion">Fashion</option>
              <option value="Dorm">Dorm</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images * (Max 3)
          </label>

          {images.length < 3 && (
            <label className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors">
              <Upload size={48} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">
                Click to upload images
              </span>
              <span className="text-xs text-gray-500 mt-1">
                PNG, JPG up to 5MB
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

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              {images.map((img, index) => (
                <div
                  key={index}
                  className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
                >
                  <Image
                    src={URL.createObjectURL(img)}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
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
            disabled={submitting}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {submitting ? "Adding..." : "Add Item"}
          </button>
        </div>
      </form>
    </div>
  );
}
