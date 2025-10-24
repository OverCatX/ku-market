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

  // excample messages
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
    {
      id: 3,
      who: "them",
      text: "Nice! Can I pick it up at Kasetsart gate 3 tomorrow?",
      time: "10:33",
    },
    {
      id: 4,
      who: "me",
      text: "Sure, tomorrow 11 AM works perfectly 😊",
      time: "10:34",
    },
  ];

  // ทุกครั้งที่เปลี่ยนห้องแชท:
  // - อัปเดต header
  // - รีเซ็ตข้อความเป็น mock
  useEffect(() => {
    setTitle(initialTitle || "Loading...");
    setSellerName(initialSeller || "Seller");
    setMsgs(FALLBACK_MESSAGES);
  }, [threadId, initialTitle, initialSeller]);

  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-none"
      style={{ background: colors.creamSoft }}
    >
      {/* Head */}
      <ChatHeader
        title={title}
        sellerName={sellerName}
        onBack={onBack} 
      />

      {/* messages */}
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
          if (!text.trim()) return;

          // optimistic update
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