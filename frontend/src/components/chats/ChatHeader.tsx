import { UserRound, ArrowLeft } from "lucide-react";

const colors = {
  oliveDark: "#4A5130",
  cream: "#F6F2E5",
};

export default function ChatHeader({
  title,
  sellerName,
  onBack,
}: {
  title: string;
  sellerName?: string;
  onBack: () => void;
}) {
  return (
    <div
      className="rounded-t-2xl px-4 py-4 flex items-start gap-3"
      style={{ background: colors.oliveDark }}
    >
      {/* Avatar */}
      <div className="h-10 w-10 rounded-full bg-white/60 flex items-center justify-center shrink-0">
        <UserRound className="text-slate-700" size={22} />
      </div>

      {/* Info block */}
      <div className="flex flex-col">
        <div className="font-semibold text-base leading-tight text-[#F6F2E5]">
          {title}
        </div>
        <div
          className="text-xs leading-tight"
          style={{ color: colors.cream }}
        >
          {sellerName || "Seller"}
        </div>
      </div>
    </div>
  );
}