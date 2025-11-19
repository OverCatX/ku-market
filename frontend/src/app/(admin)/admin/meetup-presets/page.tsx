"use client";

import { useEffect, useState, useCallback, memo } from "react";
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  X,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { API_BASE } from "@/config/constants";

interface MeetupPreset {
  id: string;
  label: string;
  locationName: string;
  address?: string;
  lat: number;
  lng: number;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    label: string;
    locationName: string;
    address?: string;
    lat: number;
    lng: number;
    isActive?: boolean;
    order?: number;
  }) => Promise<void>;
  preset?: MeetupPreset | null;
  title: string;
}

const PresetModal = memo(function PresetModal({
  isOpen,
  onClose,
  onSave,
  preset,
  title,
}: PresetModalProps) {
  const [label, setLabel] = useState("");
  const [locationName, setLocationName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    label?: string;
    locationName?: string;
    lat?: string;
    lng?: string;
  }>({});

  useEffect(() => {
    if (isOpen) {
      if (preset) {
        setLabel(preset.label);
        setLocationName(preset.locationName);
        setAddress(preset.address || "");
        setLat(preset.lat.toString());
        setLng(preset.lng.toString());
        setIsActive(preset.isActive);
        setOrder(preset.order.toString());
      } else {
        setLabel("");
        setLocationName("");
        setAddress("");
        setLat("");
        setLng("");
        setIsActive(true);
        setOrder("");
      }
      setErrors({});
    }
  }, [isOpen, preset]);

  const validate = (): boolean => {
    const newErrors: {
      label?: string;
      locationName?: string;
      lat?: string;
      lng?: string;
    } = {};

    if (!label.trim()) {
      newErrors.label = "Label is required";
    } else if (label.trim().length > 100) {
      newErrors.label = "Label must not exceed 100 characters";
    }

    if (!locationName.trim()) {
      newErrors.locationName = "Location name is required";
    } else if (locationName.trim().length > 150) {
      newErrors.locationName = "Location name must not exceed 150 characters";
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (!lat || isNaN(latNum)) {
      newErrors.lat = "Valid latitude is required";
    } else if (latNum < -90 || latNum > 90) {
      newErrors.lat = "Latitude must be between -90 and 90";
    }

    if (!lng || isNaN(lngNum)) {
      newErrors.lng = "Valid longitude is required";
    } else if (lngNum < -180 || lngNum > 180) {
      newErrors.lng = "Longitude must be between -180 and 180";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        label: label.trim(),
        locationName: locationName.trim(),
        address: address.trim() || undefined,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        isActive,
        order: order ? parseInt(order, 10) : undefined,
      });
      onClose();
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save preset");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label *
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.label
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="e.g. Main Gate"
            />
            {errors.label && (
              <p className="mt-1 text-sm text-red-600">{errors.label}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location Name *
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.locationName
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="e.g. Main Gate (Ngamwongwan)"
            />
            {errors.locationName && (
              <p className="mt-1 text-sm text-red-600">{errors.locationName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address (optional)
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Front gate near Ngamwongwan Road entrance"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude *
              </label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.lat
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="e.g. 13.846995"
              />
              {errors.lat && (
                <p className="mt-1 text-sm text-red-600">{errors.lat}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude *
              </label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.lng
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="e.g. 100.568308"
              />
              {errors.lng && (
                <p className="mt-1 text-sm text-red-600">{errors.lng}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order (optional)
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Display order"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default function MeetupPresetsPage() {
  const [presets, setPresets] = useState<MeetupPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<MeetupPreset | null>(null);
  const [deletingPreset, setDeletingPreset] = useState<MeetupPreset | null>(null);

  const loadPresets = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("authentication");
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const response = await fetch(`${API_BASE}/api/admin/meetup-presets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load presets");
      }

      const data = await response.json();
      setPresets(data.presets || []);
    } catch (error) {
      console.error("Failed to load presets:", error);
      toast.error("Failed to load meetup presets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  const handleCreate = () => {
    setEditingPreset(null);
    setIsModalOpen(true);
  };

  const handleEdit = (preset: MeetupPreset) => {
    setEditingPreset(preset);
    setIsModalOpen(true);
  };

  const handleSave = async (data: {
    label: string;
    locationName: string;
    address?: string;
    lat: number;
    lng: number;
    isActive?: boolean;
    order?: number;
  }) => {
    const token = localStorage.getItem("token") || localStorage.getItem("authentication");
    if (!token) {
      toast.error("Please login first");
      return;
    }

    try {
      if (editingPreset) {
        // Update
        const response = await fetch(
          `${API_BASE}/api/admin/meetup-presets/${editingPreset.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to update preset");
        }

        toast.success("Preset updated successfully");
      } else {
        // Create
        const response = await fetch(`${API_BASE}/api/admin/meetup-presets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to create preset");
        }

        toast.success("Preset created successfully");
      }

      await loadPresets();
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deletingPreset) return;

    const token = localStorage.getItem("token") || localStorage.getItem("authentication");
    if (!token) {
      toast.error("Please login first");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/admin/meetup-presets/${deletingPreset.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete preset");
      }

      toast.success("Preset deleted successfully");
      setDeletingPreset(null);
      await loadPresets();
    } catch (error) {
      console.error("Failed to delete preset:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete preset");
    }
  };

  const handleToggleActive = async (preset: MeetupPreset) => {
    const token = localStorage.getItem("token") || localStorage.getItem("authentication");
    if (!token) {
      toast.error("Please login first");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/admin/meetup-presets/${preset.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: !preset.isActive }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update preset");
      }

      toast.success(`Preset ${!preset.isActive ? "activated" : "deactivated"}`);
      await loadPresets();
    } catch (error) {
      console.error("Failed to toggle preset:", error);
      toast.error("Failed to update preset");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading presets...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meetup Presets</h1>
          <p className="text-gray-600 mt-1">
            Manage quick action locations for meetup map
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadPresets}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Add Preset
          </button>
        </div>
      </div>

      {presets.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No presets found
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first meetup preset to help users quickly select locations
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Add Preset
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Label
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coordinates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {presets.map((preset) => (
                <tr key={preset.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {preset.label}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {preset.locationName}
                    </div>
                    {preset.address && (
                      <div className="text-sm text-gray-500">{preset.address}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 font-mono">
                      {preset.lat.toFixed(6)}, {preset.lng.toFixed(6)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{preset.order}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(preset)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        preset.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {preset.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(preset)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setDeletingPreset(preset)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PresetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPreset(null);
        }}
        onSave={handleSave}
        preset={editingPreset}
        title={editingPreset ? "Edit Meetup Preset" : "Create Meetup Preset"}
      />

      {deletingPreset && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-red-600" size={24} />
              <h3 className="text-lg font-bold text-gray-900">Delete Preset</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &quot;{deletingPreset.label}&quot;? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingPreset(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

