"use client";

import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import Composer from "./Composer";
import Link from "next/link";

const colors = { creamSoft: "#F6F2E5" };

export type Msg = {
  id: string;
  who: "me" | "them";
  text: string;
  time: string;
  optimistic?: boolean;
};

export default function ChatWindow({
  threadId,
  partnerName,
  subtitle,
  itemInfo,
  messages,
  onSendMessage,
  onBack,
}: {
  threadId: string;
  partnerName: string;
  subtitle?: string;
  itemInfo?: {
    id: string;
    title: string;
    photo?: string | null;
  } | null;
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

      {itemInfo && (
        <div className="px-6 pt-5">
          <div className="flex items-center gap-4 rounded-2xl border border-[#E0D6C2] bg-white/80 p-4 shadow-sm">
            <div className="h-20 w-20 rounded-xl overflow-hidden bg-[#f3ede0] flex items-center justify-center">
              {itemInfo.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={itemInfo.photo}
                  alt={itemInfo.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs text-slate-400">No image</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#3f4630] truncate">
                {itemInfo.title}
              </p>
              <p className="text-xs text-slate-500">
                This conversation is about this item.
              </p>
              <Link
                href={`/marketplace/${itemInfo.id}`}
                className="inline-flex items-center justify-center mt-3 rounded-full border border-[#69773D] px-4 py-1.5 text-sm font-medium text-[#69773D] transition hover:bg-[#69773D] hover:text-white"
              >
                View item details
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Message list */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-xs text-slate-400 italic">
            No messages yet. Say hi!
          </div>
        )}

        {messages.map((m) => (
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
          onSendMessage(text);
        }}
      />
    </div>
  );
}