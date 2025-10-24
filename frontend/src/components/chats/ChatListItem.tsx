const colors = {
    cream: "#F0ECDB",
    brown: "#A0704F",
    badge: "#EFE9B9",
    oliveDark: "#4A5130",
  };
  
  export default function ChatListItem({
    item,
    active,
    onClick,
  }: {
    item: { id: string; title: string; unread: number };
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
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-xl overflow-hidden bg-white shadow-inner flex items-center justify-center text-xs text-slate-400">
            img
          </div>
  
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-800">{item.title}</div>
          </div>
  
          <div className="h-full w-16 rounded-lg flex items-center justify-center" style={{ background: colors.brown }}>
            {item.unread > 0 ? (
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: colors.badge, color: colors.oliveDark }}
              >
                {item.unread}
              </div>
            ) : (
              <div className="h-8" />
            )}
          </div>
        </div>
      </button>
    );
  }