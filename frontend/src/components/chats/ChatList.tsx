"use client";

import { useEffect, useState } from "react";
import ChatListItem from "./ChatListItem";

export type Thread = {
  id: string | number;
  title: string;
  unread: number;
  sellerName: string;
};

const FALLBACK_THREADS: Thread[] = [
  { id: "t1", title: "KU tote bag", unread: 2, sellerName: "Classic" },
  { id: "t2", title: "Strawberry smoothie", unread: 1, sellerName: "Beam" },
  { id: "t3", title: "Vintage denim jacket", unread: 0, sellerName: "Surin" },
  { id: "t4", title: "Ceramic plant pot – Handcrafted", unread: 4, sellerName: "Aom" },
  { id: "t5", title: "Green hoodie", unread: 0, sellerName: "PunPun" },
];

export default function ChatList({
  selectedId,
  autoClearId,
  onSelect,
}: {
  selectedId: string | number | null;
  autoClearId?: string | number | null;
  onSelect: (id: string | number, title: string, sellerName: string) => void;
}) {
  const [threads, setThreads] = useState<Thread[]>(FALLBACK_THREADS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

 // 1) load threads from backend
  useEffect(() => {
    setIsLoading(true);

    fetch("http://localhost:3000/api/chats/threads", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data)) {
          setThreads(data);
        }
      })
      .catch((err) => {
        console.warn("threads fetch error", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

 
  function markThreadReadLocally(threadId: string | number) {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? { ...t, unread: 0 }
          : t
      )
    );
  }


  function markThreadReadOnServer(threadId: string | number) {
    fetch(`http://localhost:3000/api/chats/threads/${String(threadId)}/mark_read`, {
      method: "POST",
      credentials: "include",
    }).catch((err) => {
      console.warn("mark_read failed", err);
    });
  }


  // 2) autoClearId:
  useEffect(() => {
    if (!autoClearId) return;
    markThreadReadLocally(autoClearId);
    markThreadReadOnServer(autoClearId);
  }, [autoClearId]);

  // 3) render items
  return (
    <div className="p-4 space-y-2">
      {isLoading && (
        <div className="text-xs text-slate-500 px-2 py-1">
          Loading chats...
        </div>
      )}

      {threads.map((t) => (
        <ChatListItem
          key={t.id}
          item={t}
          active={t.id === selectedId}
          onClick={() => {
            onSelect(t.id, t.title, t.sellerName);

            markThreadReadLocally(t.id);

            markThreadReadOnServer(t.id);
          }}
        />
      ))}

      {!isLoading && threads.length === 0 && (
        <div className="text-sm text-slate-500 px-2 py-6 text-center">
          No chats yet. Start messaging a seller from Marketplace.
        </div>
      )}
    </div>
  );
}