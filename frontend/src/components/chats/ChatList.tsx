"use client";

import ChatListItem from "./ChatListItem";

export type Thread = {
  id: string | number;
  title: string;
  unread: number;
  sellerName: string;
  lastMessage?: string;
  lastMessageAt?: string;
  otherUserName?: string;
  item?: {
    id: string;
    title: string;
    photo?: string | null;
  } | null;
};

export default function ChatList({
  threads,
  selectedId,
  onSelect,
}: {
  threads: Thread[];
  selectedId: string | number | null;
  onSelect: (thread: Thread) => void;
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
          onClick={() => onSelect(t)}
        />
      ))}
    </div>
  );
}