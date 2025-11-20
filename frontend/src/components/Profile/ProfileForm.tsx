import { Save, Upload } from "lucide-react";
import Image from "next/image";

type ProfileFormState = { name: string; faculty: string; contact: string };

type Props = {
  form: ProfileFormState;
  email: string;
  profilePicturePreview?: string | null;
  onProfilePictureChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChange: (value: ProfileFormState) => void;
  onSave: (e: React.FormEvent) => void;
  saving: boolean;
  saveMessage: string;
};

export default function ProfileForm({
  form,
  email,
  profilePicturePreview,
  onProfilePictureChange,
  onChange,
  onSave,
  saving,
  saveMessage,
}: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ ...form, [name]: value });
  };

  return (
    <form onSubmit={onSave} className="space-y-5">
      {/* Profile Picture Upload */}
      <div>
        <label className="text-sm text-gray-600 mb-2 block">
          Profile Picture
        </label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {profilePicturePreview ? (
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-[#69773D] flex-shrink-0">
              <Image
                src={profilePicturePreview}
                alt="Profile"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 80px, 96px"
              />
            </div>
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#69773D] to-[#84B067] flex items-center justify-center text-white text-xl sm:text-2xl font-bold flex-shrink-0">
              {form.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <div className="flex-1 w-full sm:w-auto">
            <label className="cursor-pointer inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors w-full sm:w-auto justify-center sm:justify-start">
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium">Upload Photo</span>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp,image/heic,image/heif,image/avif,.heic,.heif"
                onChange={onProfilePictureChange}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-1 text-center sm:text-left">
              Max 5MB, JPG/PNG/GIF
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#69773D]"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Email (KU)</label>
          <input
            value={email}
            readOnly
            className="mt-1 w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-gray-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600">Faculty</label>
          <input
            name="faculty"
            value={form.faculty}
            onChange={handleChange}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#69773D]"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Contact</label>
          <input
            name="contact"
            value={form.contact}
            onChange={handleChange}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#69773D]"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-white transition-all text-sm sm:text-base ${
            saving
              ? "bg-gray-400"
              : "bg-[#69773D] hover:bg-[#5a632d] shadow-sm hover:shadow-md"
          }`}
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saveMessage && (
          <span className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
            {saveMessage}
          </span>
        )}
      </div>
    </form>
  );
}
