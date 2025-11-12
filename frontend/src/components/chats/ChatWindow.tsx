"use client";

import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import Composer from "./Composer";

const colors = { creamSoft: "#F6F2E5" };

export type Msg = {
  id: string;
  who: "me" | "them";
  text: string;
  time: string;
  optimistic?: boolean;
};

export default function ChatWindow({
  partnerName,
  subtitle,
  messages,
  onSendMessage,
  onBack,
}: {
  partnerName: string;
  subtitle?: string;
  messages: Msg[];
  onSendMessage: (text: string) => void;
  onBack: () => void;
}) {
  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-none"
      style={{ background: colors.creamSoft }}
    >
      {/* Header */}
      <ChatHeader
        partnerName={partnerName || "Chat"}
        subtitle={subtitle}
        onBack={onBack}
      />

      {/* Message list */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-xs text-slate-400 italic">
            No messages yet. Say hi!
          </div>
        )}

        {messages.map((m) => (
          <MessageBubble key={m.id} who={m.who} text={m.text} time={m.time} />
        ))}
      </div>

      {/* Composer */}
      <Composer
        onSend={(text) => {
          if (!text.trim()) return;
          onSendMessage(text);
        }}
      />
    </div>
  );
}
