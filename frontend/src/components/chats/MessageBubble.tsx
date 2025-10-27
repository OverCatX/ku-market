const colors = {
    badge: "#EFE9B9",
  };
  
  export default function MessageBubble({
    who,
    text,
    time,
  }: {
    who: "me" | "them";
    text: string;
    time: string;
  }) {
    const isMe = who === "me";
    return (
      <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isMe ? "rounded-br-md" : "rounded-bl-md"
          }`}
          style={{ background: isMe ? colors.badge : "#E9DBC7" }}
        >
          <div className="whitespace-pre-wrap text-slate-800">{text}</div>
          <div className="text-[10px] text-slate-600 mt-1 opacity-70">{time}</div>
        </div>
      </div>
    );
  }