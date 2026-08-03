"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { sampleRooms } from "@/lib/sampleData";
import { createClient } from "@/lib/supabase/client";
import { useLocalSession } from "@/lib/session";

interface RoomStat {
  id: string;
  slug: string;
  name: string;
  format: string;
  situation: string;
  presentCount: number;
  messageCount: number;
}

// Access to this page should be restricted server-side to
// user_profiles.role = 'admin'. Not enforced in this prototype.
export default function AdminDashboard() {
  const { session } = useLocalSession();
  const [usingLiveData, setUsingLiveData] = useState(false);
  const [activeRoomCount, setActiveRoomCount] = useState(sampleRooms.length);
  const [reportsCount, setReportsCount] = useState<number | null>(null);
  const [suspendedCount, setSuspendedCount] = useState<number | null>(null);
  const [newSignupsCount, setNewSignupsCount] = useState<number | null>(null);
  const [totalPresent, setTotalPresent] = useState<number | null>(null);
  const [roomStats, setRoomStats] = useState<RoomStat[]>([]);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: roomRows, error: roomError } = await supabase
        .from("rooms")
        .select("id, slug, name, format, situation, is_active")
        .eq("is_active", true);

      if (roomError || !roomRows) return;
      setUsingLiveData(true);
      setActiveRoomCount(roomRows.length);

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { count: reportsInWindow } = await supabase
        .from("reports")
        .select("id", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo);
      setReportsCount(reportsInWindow ?? 0);

      const { count: suspended } = await supabase
        .from("user_profiles")
        .select("id", { count: "exact", head: true })
        .eq("is_suspended", true);
      setSuspendedCount(suspended ?? 0);

      const { count: newSignups } = await supabase
        .from("user_profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo);
      setNewSignupsCount(newSignups ?? 0);

      const { data: presenceRows } = await supabase.from("room_presence").select("room_id");
      const presenceByRoom: Record<string, number> = {};
      (presenceRows ?? []).forEach((p) => {
        presenceByRoom[p.room_id] = (presenceByRoom[p.room_id] ?? 0) + 1;
      });
      setTotalPresent(presenceRows?.length ?? 0);

      const { data: messageRows } = await supabase
        .from("messages")
        .select("room_id")
        .eq("is_system_message", false)
        .eq("is_deleted", false);
      const messagesByRoom: Record<string, number> = {};
      (messageRows ?? []).forEach((m) => {
        messagesByRoom[m.room_id] = (messagesByRoom[m.room_id] ?? 0) + 1;
      });

      const stats: RoomStat[] = roomRows
        .map((r) => ({
          id: r.id,
          slug: r.slug,
          name: r.name,
          format: r.format,
          situation: r.situation ?? "general",
          presentCount: presenceByRoom[r.id] ?? 0,
          messageCount: messagesByRoom[r.id] ?? 0,
        }))
        .sort((a, b) => b.presentCount - a.presentCount || b.messageCount - a.messageCount);
      setRoomStats(stats);
    }

    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: "Active rooms", value: activeRoomCount },
    { label: "People here right now", value: totalPresent ?? "—" },
    { label: "Reports (7 days)", value: reportsCount ?? "—" },
    { label: "Suspended users", value: suspendedCount ?? "—" },
    { label: "New signups (7 days)", value: newSignupsCount ?? "—" },
  ];

  return (
    <div className="min-h-screen">
      <Header displayName={session.displayName} />
      <main className="mx-auto max-w-4xl px-5 py-10">
        <h1 className="font-display text-3xl text-ink">Admin dashboard</h1>
        <p className="text-sm text-ink-soft mt-1">
          {usingLiveData
            ? "Live data, refreshes automatically every 15 seconds."
            : "Showing sample data — connect Supabase to see real activity."}
        </p>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-parchment bg-white/70 p-4">
              <p className="text-2xl font-display text-ink">{s.value}</p>
              <p className="text-xs text-ink-soft mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="font-display text-xl text-ink mb-3">Rooms, most active first</h2>
          <div className="rounded-2xl border border-parchment bg-white/70 divide-y divide-parchment">
            {(usingLiveData ? roomStats : sampleRooms).map((r) => {
              const slug = usingLiveData ? (r as RoomStat).slug : (r as typeof sampleRooms[number]).slug;
              return (
                <Link
                  key={r.id}
                  href={`/rooms/${slug}`}
                  className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-linen-deep/50 transition-colors"
                >
                  <div>
                    <span className="text-ink">{r.name}</span>
                    <span className="text-ink-soft ml-2 text-xs">
                      {usingLiveData ? (r as RoomStat).situation : (r as typeof sampleRooms[number]).format}
                    </span>
                  </div>
                  {usingLiveData ? (
                    <div className="flex items-center gap-4 text-xs text-ink-soft">
                      <span>{(r as RoomStat).presentCount} here now</span>
                      <span>{(r as RoomStat).messageCount} messages total</span>
                    </div>
                  ) : (
                    <span className="text-ink-soft">{(r as typeof sampleRooms[number]).format}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
