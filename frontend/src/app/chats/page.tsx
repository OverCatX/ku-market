"use client";
import React, { useState } from "react";
import ChatList from "@/components/chats/ChatList";
import ChatWindow from "@/components/chats/ChatWindow";

const NAV_H = 64;

export default function ChatPage() {
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string>("");
  const [selectedSeller, setSelectedSeller] = useState<string>("Seller");

  // list fullscreen mode
  if (!selectedId) {
    return (
      <div
        className="bg-white overflow-y-auto"
        style={{ height: `calc(100dvh - ${NAV_H}px)` }}
      >
        <ChatList
          selectedId={selectedId}
          autoClearId={selectedId}
          onSelect={(id, title, sellerName) => {
            setSelectedId(id);
            setSelectedTitle(title);
            setSelectedSeller(sellerName);
          }}
        />
      </div>
    );
  }

  // when clicked (list + chat window)
  return (
    <div className="bg-white">
      <div
        className="grid overflow-hidden grid-cols-[260px_1fr] md:grid-cols-[300px_1fr] xl:grid-cols-[340px_1fr]"
        style={{ height: `calc(100dvh - ${NAV_H}px)` }}
      >
        {/* LEFT list */}
        <aside className="bg-white overflow-y-auto border-r border-slate-200">
          <ChatList
            selectedId={selectedId}
            autoClearId={selectedId}
            onSelect={(id, title, sellerName) => {
              setSelectedId(id);
              setSelectedTitle(title);
              setSelectedSeller(sellerName);
            }}
          />
        </aside>
  
        {/* RIGHT chat window */}
        <section className="bg-[#F6F2E5] min-h-0 overflow-hidden">
          {selectedId && (
            <ChatWindow
              threadId={String(selectedId)}
              initialTitle={selectedTitle}
              initialSeller={selectedSeller}
              onBack={() => {
                // mobile back → back to list fullscreen mode
                setSelectedId(null);
              }}
            />
          )}
        </section>
      </div>
    </div>
  );
}