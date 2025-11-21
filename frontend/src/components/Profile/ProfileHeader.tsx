import Image from "next/image";
import { User } from "lucide-react";

export default function ProfileHeader({
  name,
  role,
  profilePicture,
}: {
  name: string;
  role: "buyer" | "seller";
  profilePicture?: string | null;
}) {
  return (
    <div className="flex items-center justify-between mb-4 sm:mb-6 flex-col sm:flex-row gap-4 sm:gap-0">
      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
        {profilePicture ? (
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#69773D] flex-shrink-0">
            <Image
              src={profilePicture}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 48px, 64px"
            />
          </div>
        ) : (
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#69773D] to-[#84B067] flex items-center justify-center text-white text-lg sm:text-xl font-bold flex-shrink-0">
            {name?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
        <div className="flex-1 sm:flex-none min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#4A5130] truncate flex items-center gap-2">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#69773D] hidden sm:block" />
          {name || "Profile"}
        </h1>
          <p className="text-xs sm:text-sm text-[#69773D] mt-1">
          Manage your personal information
        </p>
        </div>
      </div>
      <span
        className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${
          role === "seller"
            ? "bg-[#69773D]/20 text-[#69773D]"
            : "bg-[#69773D]/20 text-[#69773D]"
        }`}
      >
        {role === "seller" ? "Seller" : "Buyer"}
      </span>
    </div>
  );
}
