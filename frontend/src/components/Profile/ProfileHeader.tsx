import { User } from "lucide-react";

export default function ProfileHeader({
  name,
  role,
}: {
  name: string;
  role: "buyer" | "seller";
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-semibold text-[#4A5130] flex items-center gap-2">
          <User className="w-6 h-6 text-[#69773D]" />
          {name || "Profile"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your personal information
        </p>
      </div>
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          role === "seller"
            ? "bg-[#A0704F]/20 text-[#A0704F]"
            : "bg-[#4A5130]/20 text-[#4A5130]"
        }`}
      >
        {role === "seller" ? "Seller" : "Buyer"}
      </span>
    </div>
  );
}
