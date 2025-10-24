import ChatListItem from "./ChatListItem";

const threads = [
  { id: "t1", title: "Hat shaped keychain", unread: 2 },
  { id: "t2", title: "Hat shaped keychain", unread: 3 },
  { id: "t3", title: "Hat shaped keychain", unread: 0 },
  { id: "t4", title: "Hat shaped keychain", unread: 0 },
  { id: "t5", title: "Hat shaped keychain", unread: 0 },
];

export default function ChatList({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-4 p-4">
      {threads.map((t) => (
        <ChatListItem
          key={t.id}
          item={t}
          active={t.id === selectedId}
          onClick={() => onSelect(t.id)}
        />
      ))}
    </div>
  );
}