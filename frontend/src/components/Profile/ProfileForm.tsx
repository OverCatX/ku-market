import { Save } from "lucide-react";

type ProfileFormState = { name: string; faculty: string; contact: string };

type Props = {
  form: ProfileFormState;
  email: string;
  onChange: (value: ProfileFormState) => void;
  onSave: (e: React.FormEvent) => void;
  saving: boolean;
  saveMessage: string;
};

export default function ProfileForm({
  form,
  email,
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

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-white transition-all ${
            saving
              ? "bg-gray-400"
              : "bg-[#69773D] hover:bg-[#5a632d] shadow-sm hover:shadow-md"
          }`}
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saveMessage && (
          <span className="text-sm text-gray-600">{saveMessage}</span>
        )}
      </div>
    </form>
  );
}
