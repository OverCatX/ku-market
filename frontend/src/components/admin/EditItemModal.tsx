"use client";

import { useEffect, useState, memo } from "react";
import { X } from "lucide-react";
import { getCategories, type Category } from "@/config/categories";
import { type UpdateItemData, type ItemData } from "@/config/admin";
import toast from "react-hot-toast";

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpdateItemData) => Promise<void>;
  item: ItemData;
}

const EditItemModal = memo(function EditItemModal({
  isOpen,
  onClose,
  onSave,
  item,
}: EditItemModalProps) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [price, setPrice] = useState(item.price.toString());
  const [status, setStatus] = useState<"available" | "reserved" | "sold">(
    item.status
  );
  const [category, setCategory] = useState(item.category);
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(item.title);
      setDescription(item.description);
      setPrice(item.price.toString());
      setStatus(item.status);
      setCategory(item.category);
      getCategories()
        .then((cats) => setCategories(cats))
        .catch((error) => {
          console.error("Failed to load categories:", error);
          toast.error("Failed to load categories");
        });
    }
  }, [isOpen, item]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updateData: UpdateItemData = {
        title: title.trim() !== item.title ? title.trim() : undefined,
        description: description !== item.description ? description : undefined,
        price: parseFloat(price) !== item.price ? parseFloat(price) : undefined,
        status: status !== item.status ? status : undefined,
        category: category !== item.category ? category : undefined,
      };

      // Remove undefined fields
      const filteredData: UpdateItemData = {};
      if (updateData.title !== undefined) filteredData.title = updateData.title;
      if (updateData.description !== undefined)
        filteredData.description = updateData.description;
      if (updateData.price !== undefined) filteredData.price = updateData.price;
      if (updateData.status !== undefined)
        filteredData.status = updateData.status;
      if (updateData.category !== undefined)
        filteredData.category = updateData.category;

      if (Object.keys(filteredData).length === 0) {
        toast.error("No changes to save");
        setSubmitting(false);
        return;
      }

      await onSave(filteredData);
      onClose();
    } catch {
      // Error already handled in onSave
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Item</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={submitting}
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                required
                maxLength={4000}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (฿) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "available" | "reserved" | "sold")
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

export default EditItemModal;

