"use client";
import { useState } from "react";
import { Send } from "lucide-react";

const colors = {
  sand: "#C7A484",
  olive: "#60693A",
  cream: "#F0ECDB",
  brown: "#A0704F",
  badge: "#EFE9B9",
  oliveDark: "#4A5130",
  lightgreen: "#98A869",
};

export default function Composer({ onSend }: { onSend: (msg: string) => void }) {
  const [value, setValue] = useState("");

  return (
    <div className="p-4">
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3 shadow-sm"
        style={{ background: colors.lightgreen }}
      >
        <input
          className="flex-1 bg-transparent outline-none placeholder:text-slate-700/60"
          placeholder="Write a message..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim()) {
              onSend(value.trim());
              setValue("");
            }
          }}
        />
        <button
          onClick={() => {
            if (!value.trim()) return;
            onSend(value.trim());
            setValue("");
          }}
          className="rounded-xl px-3 py-2 font-medium flex items-center gap-2"
          style={{ background: colors.cream, color: colors.oliveDark }}
        >
          <Send size={16} />
          Send
        </button>
      </div>
    </div>
  );
}