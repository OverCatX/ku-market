import { User, LogOut } from "lucide-react";

export default function ProfileSidebar({
  profile,
  onLogout,
}: {
  profile: { name: string };
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-col items-center space-y-3 lg:min-w-[220px]">
      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-green-300 border-4 border-gray-300 shadow-md rounded-full flex items-center justify-center">
        <User className="w-12 h-12 sm:w-16 sm:h-16 text-green-800" />
      </div>
      <h2 className="text-lg sm:text-2xl font-semibold text-green-900 text-center">
        {profile.name}
      </h2>
      <button
        onClick={onLogout}
        className="mt-2 sm:mt-4 flex items-center gap-2 bg-red-200/80 hover:bg-red-300/80 text-red-900 border border-red-300 rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 font-medium shadow-sm transition-colors text-sm sm:text-base"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  );
}
