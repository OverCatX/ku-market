"use client";

import { useState, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import Composer from "./Composer";

const colors = { creamSoft: "#F6F2E5" };

type Msg = {
  id: number;
  who: "me" | "them";
  text: string;
  time: string;
};

export default function ChatWindow({
  threadId,
  initialTitle,
  initialSeller,
  onBack,
}: {
  threadId: string;
  initialTitle: string;
  initialSeller: string;
  onBack: () => void;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [title, setTitle] = useState<string>(initialTitle || "Loading...");
  const [sellerName, setSellerName] = useState<string>(
    initialSeller || "Seller"
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // fallback UI message list 
  const FALLBACK_MESSAGES: Msg[] = [
    {
      id: 1,
      who: "them",
      text: "Hello! Is this still available?",
      time: "10:30",
    },
    {
      id: 2,
      who: "me",
      text: "Hi! Yes, it’s still available 👜",
      time: "10:32",
    },
  ];

  // change threadId → reset new data
  useEffect(() => {
    // reset header 
    setTitle(initialTitle || "Loading...");
    setSellerName(initialSeller || "Seller");

    // fallback ชั่วคราว
    setMsgs(FALLBACK_MESSAGES);

    // no threadId no fetch
    if (!threadId) return;

    setIsLoading(true);

    fetch(`http://localhost:3000/api/chats/threads/${threadId}/messages`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          // if backend error → fallback messages
          return null;
        }
        return res.json();
      })
      .then((data) => {
        // {
        //   title: "KU tote bag",
        //   seller_name: "Classic",
        //   messages: [
        //     { id, sender_is_me, text, created_at_hhmm },
        //     ...
        //   ]
        // }

        if (!data) return;

        if (data.title) {
          setTitle(data.title);
        }
        if (data.seller_name) {
          setSellerName(data.seller_name);
        }
        if (Array.isArray(data.messages)) {
          const mapped: Msg[] = data.messages.map((m: any) => ({
            id: m.id,
            who: m.sender_is_me ? "me" : "them",
            text: m.text,
            time: m.created_at_hhmm,
          }));
          setMsgs(mapped);
        }
      })
      .catch((err) => {
        console.error("failed to load msgs", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [threadId, initialTitle, initialSeller]);

  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-none"
      style={{ background: colors.creamSoft }}
    >
      {/* Header */}
      <ChatHeader
        title={title}
        sellerName={sellerName}
        onBack={onBack}
      />

      {/* Message list */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-4">
        {isLoading && (
          <div className="text-xs text-slate-500">Loading messages...</div>
        )}

        {!isLoading && msgs.length === 0 && (
          <div className="text-xs text-slate-400 italic">
            No messages yet. Say hi!
          </div>
        )}

        {msgs.map((m) => (
          <MessageBubble
            key={m.id}
            who={m.who}
            text={m.text}
            time={m.time}
          />
        ))}
      </div>

      {/* Composer */}
      <Composer
        onSend={(text) => {
          if (!text.trim()) return;

          // optimistic UI update
          const newMsg: Msg = {
            id: msgs.length + 1,
            who: "me",
            text,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          setMsgs((prev) => [...prev, newMsg]);

          fetch(`http://localhost:3000/api/chats/threads/${threadId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ text }),
          }).catch((err) => {
            console.error("send failed", err);
          });
        }}
      />
    </div>
  );
}