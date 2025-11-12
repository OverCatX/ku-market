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
  const thumbnail = item.item?.photo;
  const lastMessageTime = item.lastMessageAt
    ? getRelativeTimeString(new Date(item.lastMessageAt))
    : null;

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl p-2 text-left transition shadow-sm ${
        active ? "ring-2 ring-[#98A869]" : "hover:shadow"
      }`}
      style={{ background: colors.cream }}
    >
      <div className="flex items-center gap-3">
        {/* item image */}
        <div className="h-14 w-14 rounded-xl overflow-hidden bg-white shadow-inner flex items-center justify-center">
          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnail}
              alt={item.item?.title || "Item thumbnail"}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs text-slate-400">No image</span>
          )}
        </div>

        {/* message */}
        <div className="flex-1 min-w-0">
          <div
            className="text-sm font-semibold leading-tight break-words text-[#4A5130]"
          >
            {item.item?.title || item.title}
          </div>
          <div className="text-xs text-slate-500 truncate">
            {item.lastMessage ? item.lastMessage : "No messages yet"}
          </div>
          {lastMessageTime && (
            <div className="text-[11px] text-slate-400">{lastMessageTime}</div>
          )}
        </div>

        {/* unread message */}
        {item.unread > 0 && (
          <div
            className="h-8 w-8 mr-1 rounded-full flex items-center justify-center text-sm font-semibold shadow-sm"
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

function getRelativeTimeString(date: Date): string {
  const now = Date.now();
  const diff = date.getTime() - now;
  const diffAbs = Math.abs(diff);

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 1000 * 60 * 60 * 24 * 365],
    ["month", 1000 * 60 * 60 * 24 * 30],
    ["week", 1000 * 60 * 60 * 24 * 7],
    ["day", 1000 * 60 * 60 * 24],
    ["hour", 1000 * 60 * 60],
    ["minute", 1000 * 60],
    ["second", 1000],
  ];

  for (const [unit, amount] of units) {
    if (diffAbs >= amount) {
      const value = Math.round(diff / amount);
      return new Intl.RelativeTimeFormat(undefined, {
        numeric: "auto",
      }).format(value, unit);
    }
  }

  return "just now";
}