"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { useLocalSession } from "@/lib/session";

interface DemoReport {
  id: string;
  reportedUser: string;
  reporter: string;
  room: string;
  category: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  createdAt: string;
}

const INITIAL: DemoReport[] = [
  {
    id: "rep1",
    reportedUser: "GuestX41",
    reporter: "Wren",
    room: "Night Owls",
    category: "Sexual or romantic advances",
    status: "open",
    createdAt: "2 hours ago",
  },
  {
    id: "rep2",
    reportedUser: "Marlow",
    reporter: "Sana",
    room: "Quiet Company",
    category: "Harassment",
    status: "reviewing",
    createdAt: "Yesterday",
  },
];

// Access to this page should be restricted server-side to users whose
// user_profiles.role is 'moderator' or 'admin'. This prototype does not
// enforce that — see README "Roles and access control".
export default function ModeratorDashboard() {
  const { session } = useLocalSession();
  const [reports, setReports] = useState(INITIAL);

  function updateStatus(id: string, status: DemoReport["status"]) {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  return (
    <div className="min-h-screen">
      <Header displayName={session.displayName} />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="font-display text-3xl text-ink">Moderator dashboard</h1>
        <p className="text-sm text-ink-soft mt-1">Open reports, most recent first.</p>

        <div className="mt-6 flex flex-col gap-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-2xl border border-parchment bg-white/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-ink">
                  {r.category} — <span className="text-clay">{r.reportedUser}</span>
                </p>
                <span
                  className={`text-xs rounded-full px-2.5 py-1 ${
                    r.status === "open"
                      ? "bg-clay/10 text-clay"
                      : r.status === "reviewing"
                      ? "bg-lamp/40 text-ember-deep"
                      : "bg-moss/10 text-moss"
                  }`}
                >
                  {r.status}
                </span>
              </div>
              <p className="text-xs text-ink-soft mt-1">
                Reported by {r.reporter} in {r.room} · {r.createdAt}
              </p>
              <div className="mt-3 flex gap-2 flex-wrap">
                <button
                  onClick={() => updateStatus(r.id, "reviewing")}
                  className="text-xs rounded-full border border-parchment px-3 py-1.5 hover:border-ember"
                >
                  Mark reviewing
                </button>
                <button
                  onClick={() => updateStatus(r.id, "resolved")}
                  className="text-xs rounded-full border border-parchment px-3 py-1.5 hover:border-moss"
                >
                  Resolve
                </button>
                <button
                  onClick={() => updateStatus(r.id, "dismissed")}
                  className="text-xs rounded-full border border-parchment px-3 py-1.5 hover:border-ink-soft"
                >
                  Dismiss
                </button>
                <button className="text-xs rounded-full bg-clay text-white px-3 py-1.5 hover:bg-ember-deep">
                  Suspend user
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
