"use client";

import Header from "@/components/Header";
import RoomCard from "@/components/RoomCard";
import { sampleRooms, samplePresenceByRoom } from "@/lib/sampleData";
import { useLocalSession } from "@/lib/session";
import { useState } from "react";
import { RoomFormat } from "@/lib/types";

const FILTERS: { label: string; value: RoomFormat | "all" }[] = [
  { label: "All rooms", value: "all" },
  { label: "Quiet", value: "quiet" },
  { label: "Conversation", value: "conversation" },
  { label: "Activity", value: "activity" },
];

export default function RoomsDirectoryPage() {
  const { session } = useLocalSession();
  const [filter, setFilter] = useState<RoomFormat | "all">("all");

  const rooms = sampleRooms.filter((r) => filter === "all" || r.format === filter);

  return (
    <div className="min-h-screen">
      <Header displayName={session.displayName} />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="font-display text-3xl text-ink">Rooms</h1>
        <p className="text-sm text-ink-soft mt-1">
          Come in for five minutes or stay all evening. Leave whenever you like.
        </p>

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
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              presentCount={samplePresenceByRoom[room.id]?.length ?? 0}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
