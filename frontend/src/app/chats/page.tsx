"use client";

import React, { useEffect, useState } from "react";
import ChatList, { Thread } from "@/components/chats/ChatList";
import ChatWindow from "@/components/chats/ChatWindow";

const NAV_H = 64;

// message bubble shape used by ChatWindow
export type Msg = {
  id: number;
  who: "me" | "them";
  text: string;
  time: string;
};

// messages per thread cache
type MessageMap = {
  [threadId: string]: Msg[];
};

export default function ChatPage() {
  // ---------------- state ----------------
  const [threads, setThreads] = useState<Thread[]>([]);
  const [messagesByThread, setMessagesByThread] = useState<MessageMap>({});
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string>("");
  const [selectedSeller, setSelectedSeller] = useState<string>("Seller");

  // ---------------- load thread list once ----------------
  useEffect(() => {
    fetch("http://localhost:3000/api/chats/threads", {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setThreads(data);

          // auto-open first thread on desktop
          const first = data[0];
          setSelectedId(first.id);
          setSelectedTitle(first.title);
          setSelectedSeller(first.sellerName);
        }
      })
      .catch((err) => {
        console.warn("failed to fetch threads", err);
      });
  }, []);

  // ---------------- load messages when selected thread changes ----------------
  useEffect(() => {
    if (!selectedId) return;

    const key = String(selectedId);

    // already have cache? skip re-fetch
    if (messagesByThread[key]?.length) return;

    fetch(`http://localhost:3000/api/chats/threads/${key}/messages`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;

        // ✅ define backend message structure
        interface BackendMessage {
          id: number;
          text: string;
          sender_is_me: boolean;
          created_at_hhmm: string;
        }

        // normalize backend → UI Msg
        const mapped: Msg[] = Array.isArray(data.messages)
          ? (data.messages as BackendMessage[]).map((m) => ({
              id: m.id,
              who: m.sender_is_me ? "me" : "them",
              text: m.text,
              time: m.created_at_hhmm,
            }))
          : [];

        // store cache
        setMessagesByThread((prev) => ({
          ...prev,
          [key]: mapped,
        }));

        // refresh metadata (title / seller)
        if (data.title) setSelectedTitle(data.title);
        if (data.seller_name) setSelectedSeller(data.seller_name);

        // mark read
        markThreadReadOnServer(key);
        markThreadReadLocally(key);
      })
      .catch((err) => {
        console.warn("failed to load messages", err);
      });
  }, [selectedId, messagesByThread]);

  // ---------------- helpers ----------------
  function markThreadReadLocally(threadId: string | number) {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, unread: 0 } : t))
    );
  }

  function markThreadReadOnServer(threadId: string | number) {
    fetch(
      `http://localhost:3000/api/chats/threads/${String(threadId)}/mark_read`,
      {
        method: "POST",
        credentials: "include",
      }
    ).catch((err) => console.warn("mark_read failed", err));
  }

  function handleSelectThread(
    id: string | number,
    title: string,
    sellerName: string
  ) {
    setSelectedId(id);
    setSelectedTitle(title);
    setSelectedSeller(sellerName);

    // optimistic unread clear
    markThreadReadLocally(id);
    markThreadReadOnServer(id);
  }

  // ---------------- layout / responsive ----------------
  // whole chat area height under navbar
  const heightStyle = { height: `calc(100dvh - ${NAV_H}px)` };

  return (
    <div className="bg-white">
      {/* grid wrapper:
         - mobile: single column (either list OR chat)
         - md+: two columns (list + chat) */}
      <div
        className="
          grid overflow-hidden
          md:grid-cols-[300px_1fr]
          xl:grid-cols-[340px_1fr]
        "
        style={heightStyle}
      >
{/* LEFT PANEL (chat list) */}
<aside
  className={`
    bg-white border-r border-slate-200 overflow-y-auto
    flex justify-center items-start
    ${selectedId ? "hidden md:flex" : "flex"}
  `}
  style={heightStyle}
>
  {threads.length === 0 ? (
    // --- show when there are no chats at all ---
    <div className="text-center text-base text-slate-500 leading-relaxed px-6 mt-6">
      <p className="font-medium mb-1">No chats yet.</p>
      <p>Start messaging a seller from Marketplace.</p>
    </div>
  ) : (
    // --- otherwise show chat list normally ---
    <div className="w-full">
      <ChatList
        threads={threads}
        selectedId={selectedId}
        onSelect={handleSelectThread}
      />
    </div>
  )}
</aside>

        {/* RIGHT PANEL (chat window) */}
        <section
          className={`
            bg-[#F6F2E5] min-h-0 overflow-hidden
            ${!selectedId ? "hidden md:block" : "block"}
          `}
          style={heightStyle}
        >
          {selectedId && threads.length > 0 ? (
            <ChatWindow
              threadId={String(selectedId)}
              title={selectedTitle}
              sellerName={selectedSeller}
              messages={messagesByThread[String(selectedId)] || []}
              onSendMessage={(text: string) => {
                // optimistic local append
                setMessagesByThread((prev) => {
                  const key = String(selectedId);
                  const prevMsgs = prev[key] || [];
                  const newMsg: Msg = {
                    id: Date.now(),
                    who: "me",
                    text,
                    time: new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  };
                  return { ...prev, [key]: [...prevMsgs, newMsg] };
                });

                // send to backend
                fetch(
                  `http://localhost:3000/api/chats/threads/${String(
                    selectedId
                  )}/messages`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ text }),
                  }
                ).catch((err) => console.error("send failed", err));
              }}
              onBack={() => {
                // on mobile: go back to list view
                setSelectedId(null);
              }}
            />
          ) : (
            // placeholder on desktop when nothing selected YET
            <div className="hidden h-full w-full md:flex items-center justify-center text-xs text-slate-500 italic">
              {threads.length === 0
                ? "No chats yet."
                : "Select a conversation"}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}