"use client";

import Header from "@/components/Header";
import { useLocalSession } from "@/lib/session";

const DEMO_CONNECTIONS = [
  { id: "c1", name: "Bel", lastRoom: "Morning Coffee", online: true },
  { id: "c2", name: "Idris", lastRoom: "Night Owls", online: false },
];

export default function FamiliarFacesPage() {
  const { session } = useLocalSession();

  return (
    <div className="min-h-screen">
      <Header displayName={session.displayName} />
      <main className="mx-auto max-w-2xl px-5 py-10">
        <h1 className="font-display text-3xl text-ink">Familiar Faces</h1>
        <p className="text-sm text-ink-soft mt-1">
          People you and someone else both chose to see again. Neither of you finds out unless it&rsquo;s mutual.
        </p>

        {DEMO_CONNECTIONS.length === 0 ? (
          <p className="mt-8 text-sm text-ink-soft">
            No familiar faces yet. When you and someone else both select &ldquo;I would be happy
            to see this person again&rdquo; in a room, they&rsquo;ll show up here.
          </p>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            {DEMO_CONNECTIONS.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-2xl border border-parchment bg-white/70 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-clay text-white flex items-center justify-center text-sm">
                    {c.name[0]}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">{c.name}</p>
                    <p className="text-xs text-ink-soft">
                      Last together in {c.lastRoom}
                      {c.online ? " · online now" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-xs rounded-full border border-parchment px-3 py-1.5 hover:border-ember">
                    Message
                  </button>
                  <button className="text-xs rounded-full border border-parchment px-3 py-1.5 hover:border-ember">
                    Invite to a room
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
