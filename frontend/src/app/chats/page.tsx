"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import ChatList from "@/components/chats/ChatList";
import ChatWindow from "@/components/chats/ChatWindow";

const NAV_H = 64;

export default function ChatPage() {
  const pathname = usePathname();

  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string>("");
  const [selectedSeller, setSelectedSeller] = useState<string>("");

  // ฟัง event "chat-reset" ที่ Header ยิงมา
  useEffect(() => {
    function handleReset() {
      setSelectedId(null);
    }
    window.addEventListener("chat-reset", handleReset);
    return () => {
      window.removeEventListener("chat-reset", handleReset);
    };
  }, []);

  // ถ้า user กดไปหน้า /chats ผ่านลิงก์ใหม่ ให้เคลียร์ selection ทันทีเหมือนกัน
  useEffect(() => {
    if (pathname === "/chats") {
      setSelectedId(null);
    }
  }, [pathname]);

  // mark_read อัตโนมัติเมื่อเลือกแชท
  useEffect(() => {
    if (!selectedId) return;
    fetch(`http://localhost:3000/api/chats/threads/${selectedId}/mark_read`, {
      method: "POST",
      credentials: "include",
    }).catch((err) => console.warn("auto mark_read failed", err));
  }, [selectedId]);

  // โหมดยังไม่เลือกห้อง -> list เต็มจอ
  if (!selectedId) {
    return (
      <div
        className="bg-white overflow-y-auto"
        style={{ height: `calc(100dvh - ${NAV_H}px)` }}
      >
        <ChatList
          selectedId={selectedId || ""}
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

  // โหมดเลือกห้องแล้ว -> layout 2 ฝั่ง
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
          <ChatWindow
            threadId={String(selectedId)}
            initialTitle={selectedTitle}
            initialSeller={selectedSeller}
            onBack={() => {
              setSelectedId(null);
            }}
          />
        </section>
      </div>
    </div>
  );
}