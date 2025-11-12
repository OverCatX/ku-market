"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { io, type Socket } from "socket.io-client";
import toast from "react-hot-toast";
import ChatList, { type Thread } from "@/components/chats/ChatList";
import ChatWindow, { type Msg } from "@/components/chats/ChatWindow";
import FooterSection from "@/components/home/FooterSection";
import { API_BASE } from "@/config/constants";
import { getAuthToken, clearAuthTokens } from "@/lib/auth";
import Link from "next/link";

const NAV_H = 64;

type MessageMap = Record<string, Msg[]>;

type SocketMessagePayload = {
  id: string;
  threadId: string;
  text: string;
  sender_is_me: boolean;
  created_at_hhmm: string;
};

interface RawThread {
  id?: string | number;
  _id?: string;
  title?: string;
  unread?: number | string;
  sellerName?: string;
  otherUserName?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  item?: {
    id?: string;
    _id?: string;
    title?: string;
    photo?: string | null;
  } | null;
}

type RawMessage = {
  id?: string | number;
  _id?: string | number;
  text?: string;
  sender_is_me?: boolean;
  created_at_hhmm?: string;
};

type RawMessagesResponse = {
  messages?: RawMessage[];
  title?: string;
  seller_name?: string;
  item?: {
    id?: string;
    _id?: string;
    title?: string;
    photo?: string | null;
  } | null;
};

const normalizeThread = (thread: RawThread): Thread => {
  const item = thread.item;
  const itemId = item?.id ?? item?._id ?? null;

  return {
    id: thread.id ?? thread._id ?? crypto.randomUUID(),
    title: thread.title ?? "Chat",
    unread: Number(thread.unread ?? 0),
    sellerName: thread.sellerName ?? "Seller",
    otherUserName: thread.otherUserName,
    lastMessage: thread.lastMessage,
    lastMessageAt: thread.lastMessageAt,
    item:
      itemId && item
        ? {
            id: itemId,
            title: item.title ?? thread.title ?? "Item",
            photo: item.photo ?? null,
          }
        : null,
  };
};

const normalizeMessage = (message: RawMessage): Msg => ({
  id: String(message.id ?? message._id ?? crypto.randomUUID()),
  who: message.sender_is_me ? "me" : "them",
  text: message.text ?? "",
  time: message.created_at_hhmm ?? "",
});

const FETCH_OPTIONS: RequestInit = {
  credentials: "include",
};

const buildAuthOptions = (overrides?: RequestInit): RequestInit => {
  const token = getAuthToken();
  const baseHeaders: HeadersInit = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  return {
    ...FETCH_OPTIONS,
    ...overrides,
    headers: {
      ...baseHeaders,
      ...(overrides?.headers ?? {}),
    },
  };
};

export default function ChatPage() {
  const searchParams = useSearchParams();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(false);
  const initialThreadId = searchParams.get("threadId") ?? undefined;

  useEffect(() => {
    const token = typeof window !== "undefined" ? getAuthToken() : null;
    setIsAuthenticatedState(Boolean(token));
    setAuthChecked(true);
  }, []);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f8f1] text-sm text-gray-500">
        Loading chats...
      </div>
    );
  }

  if (!isAuthenticatedState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f8f1] text-center px-6">
        <p className="text-lg font-semibold text-gray-700 mb-3">
          Please login to access chats.
        </p>
        <Link
          href="/login?redirect=/chats"
          className="px-4 py-2 rounded-lg bg-[#69773D] text-white font-medium shadow hover:shadow-lg transition"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return <ChatPageContent initialThreadId={initialThreadId} />;
}

function ChatPageContent({ initialThreadId }: { initialThreadId?: string }) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [messagesByThread, setMessagesByThread] = useState<MessageMap>({});
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileList, setShowMobileList] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  const preferredThreadRef = useRef<string | null>(initialThreadId ?? null);

  useEffect(() => {
    selectedIdRef.current = selectedId ? String(selectedId) : null;
  }, [selectedId]);

  useEffect(() => {
    preferredThreadRef.current = initialThreadId ?? null;
  }, [initialThreadId]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const applyMatch = (matches: boolean) => setIsMobile(matches);

    applyMatch(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => applyMatch(event.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", listener);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(listener);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", listener);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(listener);
      }
    };
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setShowMobileList(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (showMobileList) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
    return undefined;
  }, [showMobileList]);

  const fetchThreads = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        clearAuthTokens();
        setThreads([]);
        setSelectedId(null);
        setSelectedThread(null);
        return;
      }

      const res = await fetch(
        `${API_BASE}/api/chats/threads`,
        buildAuthOptions()
      );
      if (res.status === 401) {
        clearAuthTokens();
        setThreads([]);
        setSelectedId(null);
        setSelectedThread(null);
        return;
      }
      if (!res.ok) {
        console.warn("Failed to load threads", res.statusText);
        return;
      }
      const data = (await res.json()) as unknown;
      if (!Array.isArray(data)) {
        setThreads([]);
        setSelectedId(null);
        setSelectedThread(null);
        return;
      }

      const normalized: Thread[] = data.map((thread) =>
        normalizeThread(thread as RawThread)
      );

      setThreads(normalized);

      if (normalized.length === 0) {
        setSelectedId(null);
        setSelectedThread(null);
        return;
      }

      const preferredId = preferredThreadRef.current;
      const fallbackId = selectedId ? String(selectedId) : null;

      const targetThread =
        (preferredId && normalized.find((t) => String(t.id) === preferredId)) ||
        (fallbackId && normalized.find((t) => String(t.id) === fallbackId)) ||
        normalized[0];

      if (targetThread) {
        setSelectedId(targetThread.id);
        setSelectedThread(targetThread);
      } else {
        setSelectedId(null);
        setSelectedThread(null);
      }

      preferredThreadRef.current = null;
    } catch (error) {
      console.warn("failed to fetch threads", error);
    }
  }, [selectedId]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const scheduleThreadsRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) return;
    refreshTimeoutRef.current = setTimeout(() => {
      fetchThreads().finally(() => {
        refreshTimeoutRef.current = null;
      });
    }, 200);
  }, [fetchThreads]);

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, []);

  const markThreadReadLocally = useCallback((threadId: string | number) => {
    setThreads((prev) =>
      prev.map((t) =>
        String(t.id) === String(threadId) ? { ...t, unread: 0 } : t
      )
    );
  }, []);

  const markThreadReadOnServer = useCallback((threadId: string | number) => {
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit("mark_read", { threadId: String(threadId) });
      return;
    }
    fetch(
      `${API_BASE}/api/chats/threads/${String(threadId)}/mark_read`,
      buildAuthOptions({
        method: "POST",
      })
    ).catch((err) => console.warn("mark_read failed", err));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    const key = String(selectedId);

    if (messagesByThread[key]?.length) return;

    let aborted = false;

    async function loadMessages() {
      try {
        const res = await fetch(
          `${API_BASE}/api/chats/threads/${key}/messages`,
          buildAuthOptions()
        );
        if (res.status === 401) {
          clearAuthTokens();
          return;
        }
        if (!res.ok) {
          console.warn("failed to load messages", res.statusText);
          return;
        }
        const data = (await res.json()) as RawMessagesResponse | null;
        if (!data || aborted) return;

        const mapped: Msg[] = Array.isArray(data.messages)
          ? data.messages.map((message) => normalizeMessage(message))
          : [];

        setMessagesByThread((prev) => ({
          ...prev,
          [key]: mapped,
        }));

        setSelectedThread((prev) =>
          prev
            ? {
                ...prev,
                title: data.title ?? prev.title,
                sellerName: data.seller_name ?? prev.sellerName,
                otherUserName: data.seller_name ?? prev.otherUserName,
                item: (() => {
                  if (!data.item) {
                    return prev.item ?? null;
                  }

                  const candidateId =
                    data.item.id ?? data.item._id ?? prev.item?.id ?? null;

                  if (!candidateId) {
                    return prev.item ?? null;
                  }

                  return {
                    id: candidateId,
                    title: data.item.title ?? prev.item?.title ?? prev.title,
                    photo: data.item.photo ?? prev.item?.photo ?? null,
                  };
                })(),
              }
            : prev
        );

        markThreadReadLocally(key);
        markThreadReadOnServer(key);
      } catch (error) {
        console.warn("failed to load messages", error);
      }
    }

    loadMessages();

    return () => {
      aborted = true;
    };
  }, [
    selectedId,
    messagesByThread,
    markThreadReadLocally,
    markThreadReadOnServer,
  ]);

  const socketMessageHandler = useCallback(
    (payload: SocketMessagePayload) => {
      const threadKey = payload.threadId;
      const nextMsg: Msg = {
        id: payload.id,
        who: payload.sender_is_me ? "me" : "them",
        text: payload.text ?? "",
        time: payload.created_at_hhmm ?? "",
      };

      setMessagesByThread((prev) => {
        const existing = prev[threadKey] || [];
        if (existing.some((msg) => msg.id === nextMsg.id)) {
          return prev;
        }

        const updated = [...existing];
        if (payload.sender_is_me) {
          const optimisticIndex = updated.findIndex(
            (msg) =>
              msg.optimistic && msg.text === nextMsg.text && msg.who === "me"
          );
          if (optimisticIndex !== -1) {
            updated[optimisticIndex] = nextMsg;
          } else {
            updated.push(nextMsg);
          }
        } else {
          updated.push(nextMsg);
        }

        return {
          ...prev,
          [threadKey]: updated,
        };
      });

      const nowIso = new Date().toISOString();

      setThreads((prev) => {
        const exists = prev.some((thread) => String(thread.id) === threadKey);
        if (!exists) {
          return prev;
        }

        const isCurrent = selectedIdRef.current === threadKey;
        return prev.map((thread) => {
          if (String(thread.id) !== threadKey) {
            return thread;
          }
          const unreadCount = payload.sender_is_me
            ? thread.unread
            : isCurrent
            ? 0
            : (thread.unread ?? 0) + 1;

          return {
            ...thread,
            lastMessage: payload.text ?? thread.lastMessage,
            lastMessageAt: nowIso,
            unread: unreadCount,
          };
        });
      });

      setSelectedThread((prev) => {
        if (!prev || String(prev.id) !== threadKey) {
          return prev;
        }

        const isIncoming = !payload.sender_is_me;
        const isCurrent = selectedIdRef.current === threadKey;

        return {
          ...prev,
          lastMessage: payload.text ?? prev.lastMessage,
          lastMessageAt: nowIso,
          unread: isIncoming && !isCurrent ? (prev.unread ?? 0) + 1 : 0,
        };
      });

      if (!payload.sender_is_me) {
        const current = selectedIdRef.current;
        if (current && current === threadKey) {
          markThreadReadLocally(threadKey);
          markThreadReadOnServer(threadKey);
        } else {
          scheduleThreadsRefresh();
        }
      } else {
        scheduleThreadsRefresh();
      }
    },
    [markThreadReadLocally, markThreadReadOnServer, scheduleThreadsRefresh]
  );

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    const socket = io(API_BASE, {
      transports: ["websocket"],
      withCredentials: true,
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      scheduleThreadsRefresh();
    });

    socket.on("connect_error", (err) => {
      console.error("Chat socket error:", err.message);
      if (err.message.toLowerCase().includes("authentication")) {
        clearAuthTokens();
        toast.error("Session expired. Please login again.");
      } else {
        toast.error("Unable to connect to chat right now.");
      }
    });

    socket.on("new_message", socketMessageHandler);
    socket.on("thread_updated", () => {
      scheduleThreadsRefresh();
    });

    socket.on("error", (err: { message?: string }) => {
      if (err?.message) {
        toast.error(err.message);
      }
    });

    return () => {
      socket.off("new_message", socketMessageHandler);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [socketMessageHandler, scheduleThreadsRefresh]);

  useEffect(() => {
    if (!selectedId) return;
    const socket = socketRef.current;
    if (!socket?.connected) return;
    const threadId = String(selectedId);
    socket.emit("join_thread", { threadId });
    socket.emit("mark_read", { threadId });
  }, [selectedId]);

  const handleSelectThread = useCallback(
    (thread: Thread) => {
      setSelectedId(thread.id);
      setSelectedThread({ ...thread, unread: 0 });
      setShowMobileList(false);

      setThreads((prev) =>
        prev.map((t) =>
          String(t.id) === String(thread.id) ? { ...t, unread: 0 } : t
        )
      );

      markThreadReadLocally(thread.id);
      markThreadReadOnServer(thread.id);

      const socket = socketRef.current;
      if (socket?.connected) {
        socket.emit("join_thread", { threadId: String(thread.id) });
      }
    },
    [markThreadReadLocally, markThreadReadOnServer]
  );

  const handleSendMessage = useCallback(
    (text: string) => {
      if (!selectedId) return;
      const socket = socketRef.current;
      if (!socket?.connected) {
        toast.error("Chat connection is not ready. Please wait a moment.");
        return;
      }

      const threadId = String(selectedId);
      const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const tempId = `temp-${Date.now()}`;
      const timestamp = new Date().toISOString();

      setMessagesByThread((prev) => {
        const prevMsgs = prev[threadId] || [];
        const optimistic: Msg = {
          id: tempId,
          who: "me",
          text,
          time,
          optimistic: true,
        };
        return { ...prev, [threadId]: [...prevMsgs, optimistic] };
      });

      setThreads((prev) =>
        prev.map((thread) =>
          String(thread.id) === threadId
            ? {
                ...thread,
                lastMessage: text,
                lastMessageAt: timestamp,
                unread: 0,
              }
            : thread
        )
      );

      setSelectedThread((prev) =>
        prev && String(prev.id) === threadId
          ? { ...prev, lastMessage: text, lastMessageAt: timestamp, unread: 0 }
          : prev
      );

      socket.emit("send_message", { threadId, text });
    },
    [selectedId]
  );

  const heightStyle = { height: `calc(100dvh - ${NAV_H}px)` };

  const handleOpenList = useCallback(() => {
    if (isMobile) {
      setShowMobileList(true);
    } else {
      setSelectedId(null);
      setSelectedThread(null);
    }
  }, [isMobile]);

  return (
    <div className="bg-white">
      <div
        className="
          grid overflow-hidden
          md:grid-cols-[300px_1fr]
          xl:grid-cols-[340px_1fr]
        "
        style={heightStyle}
      >
        <aside
          className={`
            bg-white border-r border-slate-200 overflow-y-auto
            flex justify-center items-start
            ${selectedId ? "hidden md:flex" : "flex"}
          `}
          style={heightStyle}
        >
          {threads.length === 0 ? (
            <div className="text-center text-base text-slate-500 leading-relaxed px-6 mt-6">
              <p className="font-medium mb-1">No chats yet.</p>
              <p>Start messaging a seller from Marketplace.</p>
            </div>
          ) : (
            <div className="w-full">
              <ChatList
                threads={threads}
                selectedId={selectedId}
                onSelect={handleSelectThread}
              />
            </div>
          )}
        </aside>

        <section
          className={`
            bg-[#F6F2E5] min-h-0 overflow-hidden
            ${!selectedId ? "hidden md:block" : "block"}
          `}
          style={heightStyle}
        >
          {selectedId && selectedThread ? (
            <ChatWindow
              partnerName={
                selectedThread.otherUserName ??
                selectedThread.sellerName ??
                "Chat"
              }
              subtitle={selectedThread.item?.title ?? selectedThread.title}
              itemInfo={selectedThread.item}
              messages={messagesByThread[String(selectedId)] || []}
              onSendMessage={handleSendMessage}
              onBack={handleOpenList}
            />
          ) : (
            <div className="hidden h-full w-full md:flex items-center justify-center text-xs text-slate-500 italic">
              {threads.length === 0 ? "No chats yet." : "Select a conversation"}
            </div>
          )}
        </section>
      </div>
      {isMobile && showMobileList && (
        <div className="fixed inset-0 z-40 bg-black/40">
          <div
            className="absolute inset-y-0 left-0 w-full max-w-sm bg-[#F8F6ED] shadow-xl flex flex-col"
            onClick={() => setShowMobileList(false)}
          >
            <div
              className="flex items-center justify-between px-4 py-3 border-b border-[#E0D6C2]"
              onClick={(event) => event.stopPropagation()}
            >
              <h3 className="text-sm font-semibold text-[#4A5130] uppercase tracking-wide">
                Conversations
              </h3>
              <button
                type="button"
                className="rounded-full px-3 py-1 text-xs font-medium text-[#4A5130] border border-[#4A5130] hover:bg-[#4A5130] hover:text-white transition"
                onClick={() => setShowMobileList(false)}
              >
                Close
              </button>
            </div>
            <div
              className="flex-1 overflow-y-auto"
              onClick={(event) => event.stopPropagation()}
            >
              <ChatList
                threads={threads}
                selectedId={selectedId}
                onSelect={handleSelectThread}
              />
            </div>
          </div>
        </div>
      )}
      <FooterSection />
    </div>
  );
}
