import { RoomMessage, ReactionKind } from "@/lib/types";
import ReactionBar from "./ReactionBar";

export default function MessageBubble({
  message,
  reactionCounts,
  onReact,
  onReply,
  parentAuthorName,
}: {
  message: RoomMessage;
  reactionCounts: Partial<Record<ReactionKind, number>>;
  onReact: (kind: ReactionKind) => void;
  onReply?: () => void;
  parentAuthorName?: string | null;
}) {
  if (message.isSystemMessage) {
    return (
      <div className="text-center text-xs text-ink-soft/80 italic py-1 animate-fade-up">
        {message.body}
      </div>
    );
  }

  return (
    <div className={`animate-fade-up ${message.parentMessageId ? "ml-6 border-l-2 border-parchment pl-3" : ""}`}>
      {message.parentMessageId && parentAuthorName && (
        <p className="text-[11px] text-ink-soft/70 mb-0.5">↳ replying to {parentAuthorName}</p>
      )}
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
        <div className="mt-1 flex items-center gap-2">
          <ReactionBar counts={reactionCounts} onReact={onReact} />
          {onReply && (
            <button
              onClick={onReply}
              className="text-[11px] text-ink-soft hover:text-clay transition-colors"
            >
              Reply
            </button>
          )}
        </div>
      )}
    </div>
  );
}
