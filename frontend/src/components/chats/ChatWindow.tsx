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

  useEffect(() => {
    setTitle(initialTitle || "Loading...");
    setSellerName(initialSeller || "Seller");
    setMsgs([]);
  }, [threadId, initialTitle, initialSeller]);

  useEffect(() => {
    if (!threadId) return;

    fetch(`http://localhost:3000/api/chats/threads/${threadId}/messages`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.title) setTitle(data.title);
        if (data.seller_name) setSellerName(data.seller_name);

        if (Array.isArray(data.messages)) {
          setMsgs(
            data.messages.map((m: any) => ({
              id: m.id,
              who: m.sender_is_me ? "me" : "them",
              text: m.text,
              time: m.created_at_hhmm,
            }))
          );
        }
      })
      .catch((err) => console.error("failed to load msgs", err));
  }, [threadId]);

  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-none"
      style={{ background: colors.creamSoft }}
    >
      {/* Header */}
      <ChatHeader
        title={title || "Loading..."}
        sellerName={sellerName}
        onBack={onBack}
      />

      {/* text box */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-4">
        {msgs.map((m) => (
          <MessageBubble
            key={m.id}
            who={m.who}
            text={m.text}
            time={m.time}
          />
        ))}
      </div>

      {/* type box */}
      <Composer
        onSend={(text) => {
          fetch(
            `http://localhost:3000/api/chats/threads/${threadId}/messages`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ text }),
            }
          );

          setMsgs((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              who: "me",
              text,
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);
        }}
      />
    </div>
  );
}