"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { useLocalSession } from "@/lib/session";

const CATEGORIES = [
  "Harassment",
  "Sexual or romantic advances",
  "Hate speech",
  "Scam or request for money",
  "Sharing inappropriate content",
  "Threatening behaviour",
  "Self-harm concern",
  "Other",
];

export default function ReportPage() {
  const { session } = useLocalSession();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [who, setWho] = useState("");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen">
      <Header displayName={session.displayName} />
      <main className="mx-auto max-w-xl px-5 py-10">
        <h1 className="font-display text-3xl text-ink">Report a problem</h1>
        <p className="text-sm text-ink-soft mt-1">
          This goes to a moderator. Whoever you report will not see who sent it.
        </p>

        {submitted ? (
          <div className="mt-8 rounded-2xl border border-moss/30 bg-moss/10 p-5 text-sm text-ink">
            Thank you. A moderator will review this. If you feel unsafe right now, please
            also contact local emergency services.
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-4">
            <div>
              <label className="text-xs text-ink-soft">Who is this about?</label>
              <input
                value={who}
                onChange={(e) => setWho(e.target.value)}
                placeholder="Display name"
                className="mt-1 w-full rounded-xl border border-parchment bg-white/80 px-3 py-2 text-sm outline-none focus:border-ember"
              />
            </div>
            <div>
              <label className="text-xs text-ink-soft">What happened?</label>
              <div className="mt-1 flex flex-col gap-1.5">
                {CATEGORIES.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm text-ink">
                    <input
                      type="radio"
                      name="cat"
                      checked={category === c}
                      onChange={() => setCategory(c)}
                    />
                    {c}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-ink-soft">Details (optional)</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-xl border border-parchment bg-white/80 px-3 py-2 text-sm outline-none focus:border-ember"
              />
            </div>
            <button
              onClick={() => setSubmitted(true)}
              className="rounded-full bg-clay text-white py-2.5 text-sm font-medium hover:bg-ember-deep transition-colors"
            >
              Submit report
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
