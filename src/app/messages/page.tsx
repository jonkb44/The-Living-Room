"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { useLocalSession } from "@/lib/session";

const THREADS = [
  {
    id: "t1",
    name: "Bel",
    messages: [
      { from: "them", body: "Nice to sit with you this morning.", at: "9:14 AM" },
      { from: "me", body: "You too — same time tomorrow?", at: "9:16 AM" },
    ],
  },
];

export default function MessagesPage() {
  const { session } = useLocalSession();
  const [activeId, setActiveId] = useState(THREADS[0]?.id);
  const [draft, setDraft] = useState("");

  const active = THREADS.find((t) => t.id === activeId);

  return (
    <div className="min-h-screen">
      <Header displayName={session.displayName} />
      <main className="mx-auto max-w-4xl px-5 py-10 grid sm:grid-cols-[220px_1fr] gap-6">
        <div>
          <h1 className="font-display text-2xl text-ink mb-3">Messages</h1>
          <p className="text-xs text-ink-soft mb-3">
            Only with Familiar Faces. No unsolicited messages, ever.
          </p>
          <div className="flex sm:flex-col gap-2">
            {THREADS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                className={`text-left rounded-xl px-3 py-2 text-sm ${
                  activeId === t.id ? "bg-white border border-parchment" : "text-ink-soft hover:bg-white/50"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-parchment bg-white/60 flex flex-col min-h-[420px]">
          {active ? (
            <>
              <div className="border-b border-parchment px-4 py-3 text-sm font-medium text-ink">
                {active.name}
              </div>
              <div className="flex-1 p-4 flex flex-col gap-2">
                {active.messages.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                      m.from === "me"
                        ? "self-end bg-ember text-white"
                        : "self-start bg-linen-deep text-ink"
                    }`}
                  >
                    {m.body}
                    <div className={`text-[10px] mt-1 ${m.from === "me" ? "text-white/70" : "text-ink-soft"}`}>
                      {m.at}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-parchment p-3 flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a message..."
                  className="flex-1 rounded-full border border-parchment bg-white px-4 py-2 text-sm outline-none focus:border-ember"
                />
                <button
                  onClick={() => setDraft("")}
                  className="rounded-full bg-ember text-white px-4 py-2 text-sm hover:bg-ember-deep"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <p className="m-auto text-sm text-ink-soft">No conversations yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}
