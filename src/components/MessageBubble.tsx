import { RoomMessage, ReactionKind } from "@/lib/types";
import ReactionBar from "./ReactionBar";

export default function MessageBubble({
  message,
  reactionCounts,
  onReact,
}: {
  message: RoomMessage;
  reactionCounts: Partial<Record<ReactionKind, number>>;
  onReact: (kind: ReactionKind) => void;
}) {
  if (message.isSystemMessage) {
    return (
      <div className="text-center text-xs text-ink-soft/80 italic py-1 animate-fade-up">
        {message.body}
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
          message.isHostPrompt
            ? "bg-lamp/40 border border-lamp mx-auto text-center"
            : "bg-white/80 border border-parchment"
        }`}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-clay">{message.authorDisplayName}</span>
          <span className="text-[11px] text-ink-soft/70">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <p className="text-sm text-ink mt-0.5 leading-relaxed">{message.body}</p>
      </div>
      {!message.isHostPrompt && (
        <div className="mt-1">
          <ReactionBar counts={reactionCounts} onReact={onReact} />
        </div>
      )}
    </div>
  );
}
