"use client";

import { ReactionKind } from "@/lib/types";

const REACTIONS: { kind: ReactionKind; emoji: string; label: string }[] = [
  { kind: "heart", emoji: "🤍", label: "Heart" },
  { kind: "smile", emoji: "🙂", label: "Smile" },
  { kind: "wave", emoji: "👋", label: "Wave" },
  { kind: "understand", emoji: "🫶", label: "I understand" },
];

export default function ReactionBar({
  counts,
  onReact,
}: {
  counts: Partial<Record<ReactionKind, number>>;
  onReact: (kind: ReactionKind) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {REACTIONS.map((r) => (
        <button
          key={r.kind}
          onClick={() => onReact(r.kind)}
          aria-label={r.label}
          className="text-xs rounded-full px-2 py-1 bg-linen-deep hover:bg-lamp/60 transition-colors flex items-center gap-1"
        >
          <span>{r.emoji}</span>
          {counts[r.kind] ? <span className="text-ink-soft">{counts[r.kind]}</span> : null}
        </button>
      ))}
    </div>
  );
}
