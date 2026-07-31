"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import RoomCard from "@/components/RoomCard";
import { sampleRooms as fallbackRooms } from "@/lib/sampleData";
import { useLocalSession } from "@/lib/session";
import { createClient } from "@/lib/supabase/client";
import { Room, RoomFormat } from "@/lib/types";

const FILTERS: { label: string; value: RoomFormat | "all" }[] = [
  { label: "All rooms", value: "all" },
  { label: "Quiet", value: "quiet" },
  { label: "Conversation", value: "conversation" },
  { label: "Activity", value: "activity" },
];

export default function RoomsDirectoryPage() {
  const { session } = useLocalSession();
  const [filter, setFilter] = useState<RoomFormat | "all">("all");
  const [rooms, setRooms] = useState<Room[]>(fallbackRooms);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [usingLiveData, setUsingLiveData] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: roomRows, error: roomError } = await supabase
        .from("rooms")
        .select("id, slug, name, description, format, activity_level, host_id, host_prompts, is_active")
        .eq("is_active", true);

      if (roomError || !roomRows || roomRows.length === 0) {
        // Supabase not reachable yet, or schema/seed not run — fall back to
        // sample data so the page still looks right.
        return;
      }

      const mapped: Room[] = roomRows.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        description: r.description,
        format: r.format,
        activityLevel: r.activity_level,
        hostId: r.host_id,
        hostPrompts: r.host_prompts ?? [],
        isActive: r.is_active,
      }));
      setRooms(mapped);
      setUsingLiveData(true);

      const { data: presenceRows } = await supabase.from("room_presence").select("room_id");
      const nextCounts: Record<string, number> = {};
      (presenceRows ?? []).forEach((p) => {
        nextCounts[p.room_id] = (nextCounts[p.room_id] ?? 0) + 1;
      });
      setCounts(nextCounts);
    }

    load();
  }, []);

  const visibleRooms = rooms.filter((r) => filter === "all" || r.format === filter);

  return (
    <div className="min-h-screen">
      <Header displayName={session.displayName} />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="font-display text-3xl text-ink">Rooms</h1>
        <p className="text-sm text-ink-soft mt-1">
          Come in for five minutes or stay all evening. Leave whenever you like.
        </p>
        {!usingLiveData && (
          <p className="text-xs text-clay mt-2">
            Showing sample rooms — connect Supabase to see who&rsquo;s really here.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-4 py-1.5 text-sm border transition-colors ${
                filter === f.value
                  ? "bg-ink text-linen border-ink"
                  : "border-parchment text-ink-soft hover:border-ember"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleRooms.map((room) => (
            <RoomCard key={room.id} room={room} presentCount={counts[room.id] ?? 0} />
          ))}
        </div>
      </main>
    </div>
  );
}
