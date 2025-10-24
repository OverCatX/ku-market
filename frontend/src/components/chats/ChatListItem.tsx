import type { Thread } from "./ChatList";

const colors = {
  cream: "#F0ECDB",
  brown: "#A0704F",
  badgeBg: "#780606",
  badgeText: "#EFE9B9",
};

export default function ChatListItem({
  item,
  active,
  onClick,
}: {
  item: Thread;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl p-2 text-left transition shadow-sm ${
        active ? "ring-2 ring-[#C7A484]" : "hover:shadow"
      }`}
      style={{ background: colors.cream }}
    >
      <div className="flex items-center justify-between gap-3">
        {/* item image */}
        <div className="h-14 w-14 rounded-xl overflow-hidden bg-white shadow-inner flex items-center justify-center text-xs text-slate-400">
          img
        </div>

        {/* message */}
        <div className="flex-1 ml-2">
          <div className="text-sm font-semibold text-slate-800 leading-tight break-words">
            {item.title}
          </div>
        </div>

        {/* unread message */}
        {item.unread > 0 && (
          <div
            className="h-9 w-9 mr-2 rounded-full flex items-center justify-center text-xs font-semibold shadow-sm"
            style={{
              background: colors.badgeBg,
              color: colors.badgeText,
            }}
          >
            {item.unread}
          </div>
        )}
      </div>
    </button>
  );
}