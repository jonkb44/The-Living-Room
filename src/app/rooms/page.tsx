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
