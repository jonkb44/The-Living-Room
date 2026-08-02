"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import PresenceChip from "@/components/PresenceChip";
import MessageBubble from "@/components/MessageBubble";
import { sampleRooms } from "@/lib/sampleData";
import { useLocalSession } from "@/lib/session";
import { useSupabaseIdentity } from "@/lib/supabase/identity";
import { createClient } from "@/lib/supabase/client";
import { PresenceActivity, ReactionKind, Room, RoomMessage, RoomPresenceEntry } from "@/lib/types";

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
  const { session } = useLocalSession();
  const { profile, loading: identityLoading, error: identityError } = useSupabaseIdentity(
    session.displayName
  );

  const fallbackRoom = useMemo(() => sampleRooms.find((r) => r.slug === params.slug), [params.slug]);
  const [room, setRoom] = useState<Room | null>(null);
  const [usingLiveData, setUsingLiveData] = useState(false);

  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [reactions, setReactions] = useState<Record<string, Partial<Record<ReactionKind, number>>>>({});
  const [presentOthers, setPresentOthers] = useState<RoomPresenceEntry[]>([]);
  const [draft, setDraft] = useState("");
  const [isQuiet, setIsQuiet] = useState(false);
  const [activity, setActivity] = useState<PresenceActivity>("just_sitting");
  const [showReport, setShowReport] = useState<string | null>(null);
  const [interestSent, setInterestSent] = useState<Record<string, boolean>>({});
  const [crisisNotice, setCrisisNotice] = useState(false);
  const [replyTo, setReplyTo] = useState<RoomMessage | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const displayName = profile?.displayName || session.displayName || "Guest";

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function loadRoom() {
      const { data, error } = await supabase
        .from("rooms")
        .select("id, slug, name, description, format, activity_level, situation, host_id, host_prompts, is_active")
        .eq("slug", params.slug)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        if (fallbackRoom) setRoom(fallbackRoom);
        return;
      }
      setRoom({
        id: data.id,
        slug: data.slug,
        name: data.name,
        description: data.description,
        format: data.format,
        activityLevel: data.activity_level,
        situation: data.situation ?? "general",
        hostId: data.host_id,
        hostPrompts: data.host_prompts ?? [],
        isActive: data.is_active,
      });
      setUsingLiveData(true);
    }

    loadRoom();
    return () => {
      cancelled = true;
    };
  }, [params.slug, fallbackRoom]);

  useEffect(() => {
    if (!usingLiveData || !room || !profile) return;
    const supabase = createClient();
    let cancelled = false;

    async function join() {
      const { data: history } = await supabase
        .from("messages")
        .select("id, room_id, author_id, body, is_system_message, is_host_prompt, parent_message_id, created_at, user_profiles(display_name)")
        .eq("room_id", room!.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: true })
        .limit(200);

      if (!cancelled && history) {
        setMessages(
          history.map((m) => ({
            id: m.id,
            roomId: m.room_id,
            authorId: m.author_id ?? "system",
            // @ts-expect-error -- Supabase typed join comes back as an object here
            authorDisplayName: m.user_profiles?.display_name ?? "The Room",
            body: m.body,
            createdAt: m.created_at,
            isSystemMessage: m.is_system_message,
            isHostPrompt: m.is_host_prompt,
            parentMessageId: m.parent_message_id,
          }))
        );
      }

      await supabase.from("room_memberships").upsert(
        { room_id: room!.id, user_id: profile!.id },
        { onConflict: "room_id,user_id", ignoreDuplicates: true }
      );

      await supabase.from("room_presence").upsert(
        { room_id: room!.id, user_id: profile!.id, activity: "just_sitting", is_quiet: false },
        { onConflict: "room_id,user_id" }
      );

      await supabase.from("messages").insert({
        room_id: room!.id,
        author_id: null,
        body: `${displayName} has joined us. There is no need to say anything.`,
        is_system_message: true,
      });
    }

    join();

    const channel = supabase
      .channel(`room:${room.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${room.id}` },
        async (payload) => {
          const row = payload.new as {
            id: string;
            room_id: string;
            author_id: string | null;
            body: string;
            is_system_message: boolean;
            is_host_prompt: boolean;
            parent_message_id: string | null;
            created_at: string;
          };
          let authorName = "The Room";
          if (row.author_id) {
            const { data: authorProfile } = await supabase
              .from("user_profiles")
              .select("display_name")
              .eq("id", row.author_id)
              .maybeSingle();
            authorName = authorProfile?.display_name ?? "Someone";
          }
          setMessages((prev) =>
            prev.some((m) => m.id === row.id)
              ? prev
              : [
                  ...prev,
                  {
                    id: row.id,
                    roomId: row.room_id,
                    authorId: row.author_id ?? "system",
                    authorDisplayName: authorName,
                    body: row.body,
                    createdAt: row.created_at,
                    isSystemMessage: row.is_system_message,
                    isHostPrompt: row.is_host_prompt,
                    parentMessageId: row.parent_message_id,
                  },
                ]
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_presence", filter: `room_id=eq.${room.id}` },
        async () => {
          const { data: presenceRows } = await supabase
            .from("room_presence")
            .select("user_id, activity, is_quiet, joined_at, user_profiles(display_name)")
            .eq("room_id", room.id);
          setPresentOthers(
            (presenceRows ?? [])
              .filter((p) => p.user_id !== profile.id)
              .map((p) => ({
                userId: p.user_id,
                // @ts-expect-error -- typed join
                displayName: p.user_profiles?.display_name ?? "Someone",
                activity: p.activity,
                isQuiet: p.is_quiet,
                joinedAt: p.joined_at,
              }))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "message_reactions" },
        (payload) => {
          const row = payload.new as { message_id: string; kind: ReactionKind };
          setReactions((prev) => ({
            ...prev,
            [row.message_id]: {
              ...prev[row.message_id],
              [row.kind]: (prev[row.message_id]?.[row.kind] ?? 0) + 1,
            },
          }));
        }
      )
      .subscribe();

    async function leave() {
      await supabase.from("room_presence").delete().eq("room_id", room!.id).eq("user_id", profile!.id);
    }
    window.addEventListener("beforeunload", leave);

    return () => {
      cancelled = true;
      window.removeEventListener("beforeunload", leave);
      leave();
      supabase.removeChannel(channel);
    };
  }, [usingLiveData, room, profile, displayName]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  if (!room && fallbackRoom === undefined) {
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

  const activeRoom = room ?? fallbackRoom!;

  async function toggleQuiet() {
    const next = !isQuiet;
    setIsQuiet(next);

    if (usingLiveData && room && profile) {
      const supabase = createClient();
      await supabase
        .from("room_presence")
        .update({ is_quiet: next, activity })
        .eq("room_id", room.id)
        .eq("user_id", profile.id);
      await supabase.from("messages").insert({
        room_id: room.id,
        author_id: null,
        body: next ? `${displayName} is enjoying quiet company.` : `${displayName} is here.`,
        is_system_message: true,
      });
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `quiet-${Date.now()}`,
        roomId: activeRoom.id,
        authorId: "system",
        authorDisplayName: "The Room",
        body: next ? `${displayName} is enjoying quiet company.` : `${displayName} is here.`,
        createdAt: new Date().toISOString(),
        isSystemMessage: true,
      },
    ]);
  }

  async function sendMessage() {
    const body = draft.trim();
    if (!body) return;
    if (SELF_HARM_PATTERN.test(body)) setCrisisNotice(true);
    setDraft("");

    const parentMessageId = replyTo?.id ?? null;
    setReplyTo(null);

    if (usingLiveData && room && profile) {
      const supabase = createClient();
      await supabase.from("messages").insert({
        room_id: room.id,
        author_id: profile.id,
        body,
        parent_message_id: parentMessageId,
      });
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        roomId: activeRoom.id,
        authorId: "me",
        authorDisplayName: displayName,
        body,
        createdAt: new Date().toISOString(),
        parentMessageId,
      },
    ]);
  }

  async function react(messageId: string, kind: ReactionKind) {
    if (usingLiveData && profile) {
      const supabase = createClient();
      await supabase.from("message_reactions").insert({
        message_id: messageId,
        user_id: profile.id,
        kind,
      });
      return;
    }
    setReactions((prev) => ({
      ...prev,
      [messageId]: { ...prev[messageId], [kind]: (prev[messageId]?.[kind] ?? 0) + 1 },
    }));
  }

  function expressInterest(userId: string) {
    setInterestSent((prev) => ({ ...prev, [userId]: true }));
    if (usingLiveData && profile) {
      const supabase = createClient();
      supabase.from("pending_interests").insert({
        from_user_id: profile.id,
        to_user_id: userId,
        room_id: room?.id,
      });
    }
  }

  function leaveRoom() {
    router.push("/rooms");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header displayName={displayName} />

      {identityError && (
        <div className="bg-clay/10 border-b border-clay/30 text-xs text-ink px-5 py-2 text-center">
          Couldn&rsquo;t connect to the live database ({identityError}) — showing a local demo instead.
        </div>
      )}

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
            <h1 className="font-display text-2xl text-ink">{activeRoom.name}</h1>
            <p className="text-sm text-ink-soft mt-1">{activeRoom.description}</p>
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
            entry={{ userId: "me", displayName, activity, isQuiet, joinedAt: new Date().toISOString() }}
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
            onChange={async (e) => {
              const next = e.target.value as PresenceActivity;
              setActivity(next);
              if (usingLiveData && room && profile) {
                const supabase = createClient();
                await supabase
                  .from("room_presence")
                  .update({ activity: next })
                  .eq("room_id", room.id)
                  .eq("user_id", profile.id);
              }
            }}
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
              isQuiet ? "bg-moss/20 border-moss text-moss" : "border-parchment text-ink-soft hover:border-moss"
            }`}
          >
            {isQuiet ? "Sitting quietly" : "Sit quietly"}
          </button>
          {!usingLiveData && (
            <span className="text-[11px] text-clay ml-auto">Local demo — not connected to live data</span>
          )}
        </div>

        {activeRoom.hostPrompts.length > 0 && (
          <p className="mt-3 text-xs text-ink-soft italic">&ldquo;{activeRoom.hostPrompts[0]}&rdquo;</p>
        )}

        <div
          ref={scrollRef}
          className="mt-5 flex-1 rounded-2xl border border-parchment bg-white/50 p-4 flex flex-col gap-3 min-h-[320px] max-h-[50vh] overflow-y-auto"
        >
          {messages.length === 0 && (
            <p className="text-sm text-ink-soft text-center my-auto">
              {identityLoading ? "Settling in..." : "It's quiet in here right now. You're welcome to simply stay."}
            </p>
          )}
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              reactionCounts={reactions[m.id] ?? {}}
              onReact={(kind) => react(m.id, kind)}
              onReply={() => setReplyTo(m)}
              parentAuthorName={
                m.parentMessageId
                  ? messages.find((p) => p.id === m.parentMessageId)?.authorDisplayName
                  : null
              }
            />
          ))}
        </div>

        {replyTo && (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-linen-deep/60 border border-parchment px-3 py-1.5 text-xs text-ink-soft">
            <span>
              Replying to <span className="font-medium text-clay">{replyTo.authorDisplayName}</span>
              {": "}
              <span className="italic">
                {replyTo.body.length > 60 ? `${replyTo.body.slice(0, 60)}…` : replyTo.body}
              </span>
            </span>
            <button onClick={() => setReplyTo(null)} className="ml-2 shrink-0 hover:text-clay">
              Cancel
            </button>
          </div>
        )}

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
          onSubmit={async () => {
            if (usingLiveData && profile && room) {
              const supabase = createClient();
              await supabase.from("reports").insert({
                reporter_id: profile.id,
                reported_user_id: showReport,
                room_id: room.id,
                category: "other",
              });
            }
            setShowReport(null);
          }}
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
