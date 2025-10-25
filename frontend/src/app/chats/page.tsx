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

// messagesByThread
type MessageMap = {
  [threadId: string]: Msg[];
};

export default function ChatPage() {
  // all chat threads (left panel list)
  const [threads, setThreads] = useState<Thread[]>([]);

  // cached messages per thread
  const [messagesByThread, setMessagesByThread] = useState<MessageMap>({});

  // which thread is currently opened in the right panel
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string>("");
  const [selectedSeller, setSelectedSeller] = useState<string>("Seller");

  useEffect(() => {
    const fallbackThreads: Thread[] = [
      {
        id: "demo-1",
        title: "Demo item (KU tote bag)",
        unread: 0,
        sellerName: "Classic",
      },
    ];

    fetch("http://localhost:3000/api/chats/threads", {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setThreads(data);

          const first = data[0];
          setSelectedId(first.id);
          setSelectedTitle(first.title);
          setSelectedSeller(first.sellerName);
          return;
        }

        setThreads(fallbackThreads);

        const first = fallbackThreads[0];
        setSelectedId(first.id);
        setSelectedTitle(first.title);
        setSelectedSeller(first.sellerName);
      })
      .catch((err) => {
        console.warn("failed to fetch threads", err);

        // fetch totally failed → still fallback
        setThreads(fallbackThreads);

        const first = fallbackThreads[0];
        setSelectedId(first.id);
        setSelectedTitle(first.title);
        setSelectedSeller(first.sellerName);
      });
  }, []);

  // selectedId CHANGES → LOAD MESSAGES (FIRST TIME ONLY)
 
  useEffect(() => {
    if (!selectedId) return; // nothing selected yet

    const key = String(selectedId);

    // if we already have messages in cache for this thread, skip fetch
    if (messagesByThread[key]?.length) return;

    fetch(`http://localhost:3000/api/chats/threads/${key}/messages`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;

        // backend -> simplified shape for UI
        const mapped: Msg[] = Array.isArray(data.messages)
          ? data.messages.map((m: any) => ({
              id: m.id,
              who: m.sender_is_me ? "me" : "them",
              text: m.text,
              time: m.created_at_hhmm,
            }))
          : [];

        // put into local cache
        setMessagesByThread((prev) => ({
          ...prev,
          [key]: mapped,
        }));

        // update thread info if backend sends fresh title / seller
        if (data.title) setSelectedTitle(data.title);
        if (data.seller_name) setSelectedSeller(data.seller_name);

        // mark this thread as read (no unread badge)
        markThreadReadOnServer(key);
        markThreadReadLocally(key);
      })
      .catch((err) => {
        console.warn("failed to load messages", err);
      });
  }, [selectedId, messagesByThread]);

  // remove unread badge in the left list for a given threadId
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

  // user clicked a chat item on the left
  function handleSelectThread(
    id: string | number,
    title: string,
    sellerName: string
  ) {
    setSelectedId(id);
    setSelectedTitle(title);
    setSelectedSeller(sellerName);

    // optimistic clear unread badge right away
    markThreadReadLocally(id);
    markThreadReadOnServer(id);
  }

  // simulate server pushed new message into thread
  // for testing
  function mockIncomingMessage(threadId: string | number, text: string) {
    const key = String(threadId);

    // append new message in local cache
    setMessagesByThread((prev) => {
      const prevMsgs = prev[key] || [];
      const newMsg: Msg = {
        id: Date.now(),
        who: "them",
        text,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      return { ...prev, [key]: [...prevMsgs, newMsg] };
    });

    // if the user is NOT currently viewing that thread,
    // bump its unread badge
    if (threadId !== selectedId) {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId ? { ...t, unread: t.unread + 1 } : t
        )
      );
    }
  }

  // RENDER

  const heightStyle = { height: `calc(100dvh - ${NAV_H}px)` };

  if (!selectedId) {
    return (
      <div className="bg-white overflow-y-auto" style={heightStyle}>
        {threads.length === 0 && (
          <div className="text-center text-sm text-slate-500 py-8">
            No chats yet. Start messaging a seller from Marketplace.
          </div>
        )}
  
        <ChatList
          threads={threads}
          selectedId={selectedId}
          onSelect={handleSelectThread}
        />
  
        {/* dev helper / simulate incoming message */}
        <div className="p-4 text-center text-xs text-slate-500">
          <button
            className="rounded bg-slate-200 px-3 py-1 text-[11px]"
            onClick={() => {
              if (threads.length === 0) return;
              mockIncomingMessage(
                threads[0].id,
                "Hi there!"
              );
            }}
          >
            simulate new message (first chat)
          </button>
        </div>
      </div>
    );
  }

  // Normal 2-column chat layout
  return (
    <div className="bg-white">
      <div
        className="grid overflow-hidden grid-cols-[260px_1fr] md:grid-cols-[300px_1fr] xl:grid-cols-[340px_1fr]"
        style={heightStyle}
      >
        {/* LEFT PANEL: chat list */}
        <aside className="bg-white overflow-y-auto border-r border-slate-200">
          <ChatList
            threads={threads}
            selectedId={selectedId}
            onSelect={handleSelectThread}
          />

          {/* simulate server pushing new message to the thread */}
          <div className="p-4 text-center text-[11px] text-slate-500 border-t">
            <button
              className="rounded bg-slate-200 px-3 py-1"
              onClick={() => {
                if (!selectedId) return;
                mockIncomingMessage(
                  selectedId,
                  "Hi"
                );
              }}
            >
              simulate new message (current chat)
            </button>
          </div>
        </aside>

        {/* RIGHT PANEL: message area */}
        <section className="bg-[#F6F2E5] min-h-0 overflow-hidden">
          <ChatWindow
            threadId={String(selectedId)}
            title={selectedTitle}
            sellerName={selectedSeller}
            messages={messagesByThread[String(selectedId)] || []}
            onSendMessage={(text: string) => {
              // optimistic UI: show my message instantly
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

              // post to backend
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
              // mobile 'back' = go to list-only mode
              setSelectedId(null);
            }}
          />
        </section>
      </div>
    </div>
  );
}