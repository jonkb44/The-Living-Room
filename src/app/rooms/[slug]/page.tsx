"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import PresenceChip from "@/components/PresenceChip";
import MessageBubble from "@/components/MessageBubble";
import { sampleRooms, samplePresenceByRoom, sampleMessagesByRoom } from "@/lib/sampleData";
import { useLocalSession } from "@/lib/session";
import { PresenceActivity, ReactionKind, RoomMessage } from "@/lib/types";

const ACTIVITY_OPTIONS: { value: PresenceActivity; label: string }[] = [
  { value: "coffee", label: "Having coffee" },
  { value: "reading", label: "Reading" },
  { value: "cooking", label: "Cooking" },
  { value: "watching_tv", label: "Watching television" },
  { value: "working", label: "Working" },
  { value: "listening_to_music", label: "Listening to music" },
  { value: "resting", label: "Resting" },
  { value: "trying_to_sleep", label: "Trying to sleep" },
  { value: "just_sitting", label: "Just sitting here" },
];

const REPORT_CATEGORIES = [
  "Harassment",
  "Sexual or romantic advances",
  "Hate speech",
  "Scam or request for money",
  "Sharing inappropriate content",
  "Threatening behaviour",
  "Self-harm concern",
  "Other",
];

const SELF_HARM_PATTERN = /\b(suicid|kill myself|end my life|hurt myself|self.?harm)\b/i;

export default function RoomPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { session, loaded } = useLocalSession();

  const room = useMemo(() => sampleRooms.find((r) => r.slug === params.slug), [params.slug]);

  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [reactions, setReactions] = useState<Record<string, Partial<Record<ReactionKind, number>>>>({});
  const [draft, setDraft] = useState("");
  const [isQuiet, setIsQuiet] = useState(false);
  const [activity, setActivity] = useState<PresenceActivity>("just_sitting");
  const [hasJoined, setHasJoined] = useState(false);
  const [showReport, setShowReport] = useState<string | null>(null);
  const [interestSent, setInterestSent] = useState<Record<string, boolean>>({});
  const [crisisNotice, setCrisisNotice] = useState(false);

  useEffect(() => {
    if (!room || hasJoined || !loaded) return;
    const name = session.displayName || "Guest";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading this room's history + announcing arrival are one-time syncs with external systems (sample data / would-be realtime channel) on room entry, not derived render state
    setMessages([
      ...(sampleMessagesByRoom[room.id] ?? []),
      {
        id: `join-${Date.now()}`,
        roomId: room.id,
        authorId: "system",
        authorDisplayName: "The Room",
        body: `${name} has joined us. There is no need to say anything.`,
        createdAt: new Date().toISOString(),
        isSystemMessage: true,
      },
    ]);
    setHasJoined(true);
    // In production: supabase.from('room_presence').upsert({ room_id, user_id, activity, is_quiet })
    // plus a realtime channel subscription to reflect presence for everyone else instantly.
  }, [room, hasJoined, loaded, session.displayName]);

  if (!room) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-2xl px-5 py-16 text-center">
          <p className="text-ink-soft">This room doesn&rsquo;t exist, or has closed.</p>
          <Link href="/rooms" className="text-clay hover:text-ember-deep text-sm">
            ← Back to rooms
          </Link>
        </main>
      </div>
    );
  }

  const presentOthers = samplePresenceByRoom[room.id] ?? [];
  const displayName = session.displayName || "Guest";

  function toggleQuiet() {
    const next = !isQuiet;
    setIsQuiet(next);
    setMessages((prev) => [
      ...prev,
      {
        id: `quiet-${Date.now()}`,
        roomId: room!.id,
        authorId: "system",
        authorDisplayName: "The Room",
        body: next
          ? `${displayName} is enjoying quiet company.`
          : `${displayName} is here.`,
        createdAt: new Date().toISOString(),
        isSystemMessage: true,
      },
    ]);
  }

  function sendMessage() {
    const body = draft.trim();
    if (!body) return;

    if (SELF_HARM_PATTERN.test(body)) {
      setCrisisNotice(true);
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        roomId: room!.id,
        authorId: "me",
        authorDisplayName: displayName,
        body,
        createdAt: new Date().toISOString(),
      },
    ]);
    setDraft("");
    // In production: insert into `messages`; rely on Postgres/regex or an
    // edge function for prohibited-word and self-harm detection server-side
    // as well, not just client-side.
  }

  function react(messageId: string, kind: ReactionKind) {
    setReactions((prev) => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        [kind]: (prev[messageId]?.[kind] ?? 0) + 1,
      },
    }));
  }

  function expressInterest(userId: string) {
    setInterestSent((prev) => ({ ...prev, [userId]: true }));
    // In production: insert into pending_interests; a trigger promotes it
    // to mutual_connections automatically if the other side already sent one.
  }

  function leaveRoom() {
    router.push("/rooms");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header displayName={session.displayName} />

      {crisisNotice && (
        <div className="bg-clay/10 border-b border-clay/30 text-sm text-ink px-5 py-3 text-center">
          It sounds like things might be hard right now. The Living Room isn&rsquo;t a crisis
          service, but support is available. In Australia, Lifeline is 13 11 14, available
          24/7. If you are outside Australia, please contact your local emergency or crisis
          line.{" "}
          <button onClick={() => setCrisisNotice(false)} className="underline ml-1">
            Dismiss
          </button>
        </div>
      )}

      <main className="mx-auto max-w-3xl w-full px-5 py-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-ink">{room.name}</h1>
            <p className="text-sm text-ink-soft mt-1">{room.description}</p>
          </div>
          <button
            onClick={leaveRoom}
            className="shrink-0 rounded-full border border-parchment px-4 py-2 text-sm text-ink-soft hover:border-clay hover:text-clay transition-colors"
          >
            Leave room
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <PresenceChip
            entry={{
              userId: "me",
              displayName,
              activity,
              isQuiet,
              joinedAt: new Date().toISOString(),
            }}
          />
          {presentOthers.map((p) => (
            <div key={p.userId} className="group relative">
              <PresenceChip entry={p} />
              <div className="hidden group-hover:flex absolute z-10 top-full mt-1 left-0 gap-1 bg-white border border-parchment rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => expressInterest(p.userId)}
                  disabled={interestSent[p.userId]}
                  className="text-[11px] whitespace-nowrap px-2 py-1 rounded hover:bg-linen-deep disabled:text-moss"
                >
                  {interestSent[p.userId] ? "Noted ✓" : "See again?"}
                </button>
                <button
                  onClick={() => setShowReport(p.userId)}
                  className="text-[11px] whitespace-nowrap px-2 py-1 rounded hover:bg-linen-deep text-clay"
                >
                  Report
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-ink-soft">You&rsquo;re:</span>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value as PresenceActivity)}
            className="text-xs rounded-full border border-parchment bg-white/80 px-3 py-1.5 outline-none"
          >
            {ACTIVITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={toggleQuiet}
            className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${
              isQuiet
                ? "bg-moss/20 border-moss text-moss"
                : "border-parchment text-ink-soft hover:border-moss"
            }`}
          >
            {isQuiet ? "Sitting quietly" : "Sit quietly"}
          </button>
        </div>

        {room.hostPrompts.length > 0 && (
          <p className="mt-3 text-xs text-ink-soft italic">
            &ldquo;{room.hostPrompts[0]}&rdquo;
          </p>
        )}

        <div className="mt-5 flex-1 rounded-2xl border border-parchment bg-white/50 p-4 flex flex-col gap-3 min-h-[320px] max-h-[50vh] overflow-y-auto">
          {messages.length === 0 && (
            <p className="text-sm text-ink-soft text-center my-auto">
              It&rsquo;s quiet in here right now. You&rsquo;re welcome to simply stay.
            </p>
          )}
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              reactionCounts={reactions[m.id] ?? {}}
              onReact={(kind) => react(m.id, kind)}
            />
          ))}
        </div>

        {!isQuiet ? (
          <div className="mt-3 flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              maxLength={600}
              placeholder="Say something, or don't — no pressure."
              className="flex-1 rounded-full border border-parchment bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-ember"
            />
            <button
              onClick={sendMessage}
              disabled={!draft.trim()}
              className="rounded-full bg-ember text-white px-5 py-2.5 text-sm font-medium disabled:opacity-40 hover:bg-ember-deep transition-colors"
            >
              Send
            </button>
          </div>
        ) : (
          <p className="mt-3 text-center text-xs text-ink-soft italic">
            You&rsquo;re sitting quietly. Turn this off any time to join in.
          </p>
        )}

        <p className="mt-4 text-center text-xs text-ink-soft/70">
          <Link href="/community-standards" className="underline">
            Room guidelines
          </Link>
        </p>
      </main>

      {showReport && (
        <ReportModal
          onClose={() => setShowReport(null)}
          onSubmit={() => setShowReport(null)}
        />
      )}
    </div>
  );
}

function ReportModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
  const [category, setCategory] = useState(REPORT_CATEGORIES[0]);
  const [details, setDetails] = useState("");

  return (
    <div className="fixed inset-0 bg-ink/30 flex items-center justify-center px-5 z-40">
      <div className="bg-linen rounded-2xl max-w-sm w-full p-5 border border-parchment">
        <h2 className="font-display text-lg text-ink">Report this person</h2>
        <p className="text-xs text-ink-soft mt-1">
          This is reviewed by a moderator. The other person won&rsquo;t be told who reported them.
        </p>
        <div className="mt-3 flex flex-col gap-1.5">
          {REPORT_CATEGORIES.map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm text-ink">
              <input
                type="radio"
                name="report-category"
                checked={category === c}
                onChange={() => setCategory(c)}
              />
              {c}
            </label>
          ))}
        </div>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Anything else that would help us understand (optional)"
          className="mt-3 w-full rounded-xl border border-parchment bg-white/80 px-3 py-2 text-sm outline-none focus:border-ember"
          rows={3}
        />
        <div className="mt-4 flex gap-2 justify-end">
          <button onClick={onClose} className="text-sm text-ink-soft px-4 py-2">
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="text-sm bg-clay text-white rounded-full px-4 py-2 hover:bg-ember-deep transition-colors"
          >
            Submit report
          </button>
        </div>
      </div>
    </div>
  );
}
