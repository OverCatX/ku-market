"use client";
import { useEffect, useState } from "react";
import ChatListItem from "./ChatListItem";

export type Thread = {
  id: string | number;
  title: string;
  unread: number;
  sellerName: string;
};

// fallback mock data
const FALLBACK_THREADS: Thread[] = [
  { id: "t1", title: "KU tote bag", unread: 2, sellerName: "Classic" },
  { id: "t2", title: "Strawberry smoothie", unread: 1, sellerName: "Beam" },
  { id: "t3", title: "Vintage denim jacket", unread: 0, sellerName: "Surin" },
  { id: "t4", title: "Ceramic plant pot – Handcrafted", unread: 4, sellerName: "Aom" },
  { id: "t5", title: "Green hoodie", unread: 0, sellerName: "PunPun" },
];

export default function ChatList({
  selectedId,
  onSelect,
  autoClearId,
}: {
  selectedId: string | number | null;
  autoClearId: string | number | null;
  onSelect: (id: string | number, title: string, sellerName: string) => void;
}) {
  const [threads, setThreads] = useState<Thread[]>(FALLBACK_THREADS);

  useEffect(() => {
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
      });
  }, []);

  function markThreadAsRead(id: string | number) {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, unread: 0 } : t))
    );
  }

  useEffect(() => {
    if (!autoClearId) return;
    markThreadAsRead(autoClearId);
  }, [autoClearId]);

  return (
    <div className="p-4 space-y-2">
      {threads.map((t) => (
        <ChatListItem
          key={t.id}
          item={t}
          active={t.id === selectedId}
          onClick={() => {
            onSelect(t.id, t.title, t.sellerName);

            markThreadAsRead(t.id);

            fetch(
              `http://localhost:3000/api/chats/threads/${String(t.id)}/mark_read`,
              {
                method: "POST",
                credentials: "include",
              }
            ).catch((err) => {
              console.warn("mark_read failed", err);
            });
          }}
        />
      ))}
    </div>
  );
}