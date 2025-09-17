import InputField from "./InputField";
import { RefreshCw } from "lucide-react";

export default function ProfileForm({
  profile,
  setProfile,
  editing,
  setEditing,
  onSave,
}: {
  profile: { name: string; faculty: string; email: string };
  setProfile: React.Dispatch<React.SetStateAction<typeof profile>>;
  editing: boolean;
  setEditing: React.Dispatch<React.SetStateAction<boolean>>;
  onSave: () => void;
}) {
  return (
    <div className="bg-white border border-gray-200 p-4 sm:p-6 md:p-6 rounded-2xl shadow-lg space-y-4 sm:space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg sm:text-xl font-semibold text-green-900">
          Profile Info
        </h3>
        <button
          onClick={() => (editing ? onSave() : setEditing(true))}
          className="flex items-center gap-1 sm:gap-2 bg-green-200/80 hover:bg-green-300/80 text-green-900 border border-green-300 rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 font-medium shadow-sm text-sm sm:text-base transition-colors"
        >
          <RefreshCw className="w-3 sm:w-4 h-3 sm:h-4" />
          {editing ? "Save" : "Edit"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <InputField
          label="Name"
          value={profile.name}
          disabled={!editing}
          onChange={(val) => setProfile((p) => ({ ...p, name: val }))}
        />
        <InputField
          label="Faculty"
          value={profile.faculty}
          disabled={!editing}
          onChange={(val) => setProfile((p) => ({ ...p, faculty: val }))}
        />
        <InputField
          label="Email"
          value={profile.email}
          disabled={!editing}
          onChange={(val) => setProfile((p) => ({ ...p, email: val }))}
        />
      </div>
    </div>
  );
}
