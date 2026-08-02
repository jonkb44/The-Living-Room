"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import RoomCard from "@/components/RoomCard";
import { sampleRooms as fallbackRooms } from "@/lib/sampleData";
import { useLocalSession } from "@/lib/session";
import { createClient } from "@/lib/supabase/client";
import { Room, RoomFormat, ROOM_SITUATION_LABELS } from "@/lib/types";

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
        .select("id, slug, name, description, format, activity_level, situation, host_id, host_prompts, is_active")
        .eq("is_active", true);

      if (roomError || !roomRows || roomRows.length === 0) {
        return;
      }

      const mapped: Room[] = roomRows.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        description: r.description,
        format: r.format,
        activityLevel: r.activity_level,
        situation: r.situation ?? "general",
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

  const rebuildingRooms = rooms.filter((r) => r.situation !== "general");
  const generalRooms = rooms.filter((r) => r.situation === "general");
  const visibleGeneralRooms = generalRooms.filter((r) => filter === "all" || r.format === filter);

  const rebuildingBySituation = rebuildingRooms.reduce<Record<string, Room[]>>((acc, room) => {
    acc[room.situation] = acc[room.situation] ?? [];
    acc[room.situation].push(room);
    return acc;
  }, {});

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

        {Object.keys(rebuildingBySituation).length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-xl text-ink">Rebuilding</h2>
            <p className="text-sm text-ink-soft mt-1">
              For anyone starting over after loss, retirement, or a big change. Come as you are.
            </p>
            <div className="mt-4 space-y-6">
              {Object.entries(rebuildingBySituation).map(([situation, situationRooms]) => (
                <div key={situation}>
                  <h3 className="text-sm font-medium text-ink-soft uppercase tracking-wide">
                    {ROOM_SITUATION_LABELS[situation as keyof typeof ROOM_SITUATION_LABELS] ?? situation}
                  </h3>
                  <div className="mt-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {situationRooms.map((room) => (
                      <RoomCard key={room.id} room={room} presentCount={counts[room.id] ?? 0} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-10">
          <h2 className="font-display text-xl text-ink">The Living Room</h2>
          <p className="text-sm text-ink-soft mt-1">
            No theme, no situation, just company.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
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
            {visibleGeneralRooms.map((room) => (
              <RoomCard key={room.id} room={room} presentCount={counts[room.id] ?? 0} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
