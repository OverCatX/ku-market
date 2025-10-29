"use client";

import ChatListItem from "./ChatListItem";

export type Thread = {
  id: string | number;
  title: string;
  unread: number;
  sellerName: string;
};

export default function ChatList({
  threads,
  selectedId,
  onSelect,
}: {
  threads: Thread[];
  selectedId: string | number | null;
  onSelect: (id: string | number, title: string, sellerName: string) => void;
}) {
  return (
    <div className="p-4 space-y-2">
      {threads.length === 0 && (
        <div className="text-sm text-slate-500 px-2 py-6 text-center">
          No chats yet. Start messaging a seller from Marketplace.
        </div>
      )}

      {threads.map((t) => (
        <ChatListItem
          key={t.id}
          item={t}
          active={t.id === selectedId}
          onClick={() => onSelect(t.id, t.title, t.sellerName)}
        />
      ))}
    </div>
  );
}