"use client";

import Header from "@/components/Header";
import { useLocalSession } from "@/lib/session";
import { useState } from "react";

export default function ProfilePage() {
  const { session, update, clear, loaded } = useLocalSession();
  const [shareStatus, setShareStatus] = useState(false);

  if (!loaded) return null;

  return (
    <div className="min-h-screen">
      <Header displayName={session.displayName} />
      <main className="mx-auto max-w-xl px-5 py-10">
        <h1 className="font-display text-3xl text-ink">Settings & privacy</h1>

        <div className="mt-6 rounded-2xl border border-parchment bg-white/70 p-5">
          <label className="text-sm text-ink-soft">Display name</label>
          <input
            defaultValue={session.displayName}
            onBlur={(e) => update({ displayName: e.target.value })}
            className="mt-1 w-full rounded-xl border border-parchment bg-white px-3 py-2 text-sm outline-none focus:border-ember"
          />
          <p className="text-xs text-ink-soft mt-1">
            No surname, photo or contact details are ever required.
          </p>
        </div>

        <div className="mt-4 rounded-2xl border border-parchment bg-white/70 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-ink">Show when I&rsquo;m online to Familiar Faces</p>
            <p className="text-xs text-ink-soft">Off by default. Never shown to anyone else.</p>
          </div>
          <button
            onClick={() => setShareStatus((v) => !v)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              shareStatus ? "bg-ember" : "bg-parchment"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                shareStatus ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-parchment bg-white/70 p-5">
          <p className="text-sm text-ink">Blocked people</p>
          <p className="text-xs text-ink-soft mt-1">You haven&rsquo;t blocked anyone.</p>
        </div>

        <div className="mt-4 rounded-2xl border border-clay/30 bg-clay/5 p-5">
          <p className="text-sm text-ink">Leave The Living Room</p>
          <p className="text-xs text-ink-soft mt-1 mb-3">
            This clears your local session on this device (guest demo only).
          </p>
          <button
            onClick={clear}
            className="text-sm rounded-full border border-clay text-clay px-4 py-2 hover:bg-clay hover:text-white transition-colors"
          >
            Clear my session
          </button>
        </div>
      </main>
    </div>
  );
}
