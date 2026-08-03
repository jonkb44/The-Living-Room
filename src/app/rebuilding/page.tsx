"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import RoomCard from "@/components/RoomCard";
import { sampleRooms as fallbackRooms } from "@/lib/sampleData";
import { createClient } from "@/lib/supabase/client";
import { Room } from "@/lib/types";

export default function RebuildingLandingPage() {
  const [rooms, setRooms] = useState<Room[]>(fallbackRooms.filter((r) => r.situation !== "general"));
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: roomRows } = await supabase
        .from("rooms")
        .select("id, slug, name, description, format, activity_level, situation, host_id, host_prompts, is_active")
        .eq("is_active", true)
        .neq("situation", "general");

      if (!roomRows || roomRows.length === 0) return;

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

      const { data: presenceRows } = await supabase.from("room_presence").select("room_id");
      const nextCounts: Record<string, number> = {};
      (presenceRows ?? []).forEach((p) => {
        nextCounts[p.room_id] = (nextCounts[p.room_id] ?? 0) + 1;
      });
      setCounts(nextCounts);
    }

    load();
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-4xl px-5">
        <section className="pt-16 pb-12 text-center">
          <h1 className="font-display text-4xl sm:text-5xl leading-tight text-ink max-w-2xl mx-auto">
            You didn&rsquo;t just lose a marriage. Or a career. Or the house that used to be full.
          </h1>
          <p className="mt-3 font-display text-2xl sm:text-3xl text-clay max-w-2xl mx-auto">
            You lost who you were in it. This is a room for figuring out who&rsquo;s next.
          </p>
          <p className="mt-6 text-ink-soft max-w-xl mx-auto leading-relaxed">
            Whatever brought you here, divorce, retirement, an empty nest, a career that
            ended, you know the feeling: the role is gone, and so is the structure it gave
            your days. This is a place to not perform fine. Start in a room with people who
            get exactly where you are. No profile to curate, nothing to explain.
          </p>
          <div className="mt-8">
            <Link
              href="#rooms"
              className="rounded-full bg-ember text-white px-6 py-3 text-sm font-medium hover:bg-ember-deep transition-colors shadow-sm"
            >
              See the rooms
            </Link>
          </div>
        </section>

        <section className="pb-10 grid sm:grid-cols-3 gap-6 text-sm text-ink-soft text-center sm:text-left">
          <div>
            <h3 className="font-display text-lg text-ink mb-1">Start specific</h3>
            <p>A room for exactly your situation, with people who understand it without you explaining.</p>
          </div>
          <div>
            <h3 className="font-display text-lg text-ink mb-1">No pressure to perform</h3>
            <p>Come in for five minutes or stay all evening. Say nothing, or say everything.</p>
          </div>
          <div>
            <h3 className="font-display text-lg text-ink mb-1">Move forward when ready</h3>
            <p>When you&rsquo;re ready, step into the wider Living Room, no one decides that timeline but you.</p>
          </div>
        </section>

        <section id="rooms" className="pb-16 pt-6 scroll-mt-16">
          <h2 className="font-display text-2xl text-ink text-center mb-6">Find your room</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} presentCount={counts[room.id] ?? 0} />
            ))}
          </div>
        </section>

        <section className="pb-24 border-t border-parchment pt-12 text-center">
          <h2 className="font-display text-2xl text-ink">When you&rsquo;re ready</h2>
          <p className="mt-3 text-ink-soft max-w-xl mx-auto leading-relaxed">
            These rooms aren&rsquo;t the whole house. When the raw part eases, even a little,
            The Living Room is a wider space, no situation, no label, just people. Some come
            here to talk, some to sit quietly, some to slowly feel normal again. There&rsquo;s
            no timeline. You decide when, or if, you want to step in.
          </p>
          <div className="mt-6">
            <Link
              href="/rooms"
              className="rounded-full px-6 py-3 text-sm font-medium border border-parchment text-ink hover:border-ember hover:text-ember-deep transition-colors"
            >
              See all rooms →
            </Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-parchment py-8 text-center text-xs text-ink-soft/70">
        <div className="flex items-center justify-center gap-4">
          <Link href="/community-standards">Community standards</Link>
          <span>·</span>
          <Link href="/profile">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
