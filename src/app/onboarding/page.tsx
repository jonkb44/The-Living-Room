"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocalSession } from "@/lib/session";
import { companyPreferenceLabels, feelingLabels, suggestRoomSlugs } from "@/lib/sampleData";
import { CompanyPreference, Feeling } from "@/lib/types";

type Step = "name" | "age" | "preference" | "feeling" | "done";

export default function OnboardingPage() {
  const { update } = useLocalSession();
  const router = useRouter();
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [preference, setPreference] = useState<CompanyPreference | null>(null);
  const [feeling, setFeeling] = useState<Feeling | null>(null);

  function finish(finalFeeling: Feeling | null) {
    update({
      displayName: name.trim() || "Guest",
      isGuest: true,
      companyPreference: preference,
      currentFeeling: finalFeeling,
      ageConfirmed,
    });
    setStep("done");
  }

  const suggestions = suggestRoomSlugs(preference, feeling);

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-md">
        <Link href="/" className="text-sm text-ink-soft hover:text-ink">
          ← Back
        </Link>

        {step === "name" && (
          <div className="mt-6 animate-fade-up">
            <h1 className="font-display text-2xl text-ink">What should we call you?</h1>
            <p className="text-sm text-ink-soft mt-1">A first name, nickname or pseudonym is fine.</p>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              placeholder="e.g. Ren"
              className="mt-4 w-full rounded-xl border border-parchment bg-white/80 px-4 py-3 text-ink outline-none focus:border-ember"
            />
            <button
              disabled={!name.trim()}
              onClick={() => setStep("age")}
              className="mt-4 w-full rounded-full bg-ember text-white py-3 text-sm font-medium disabled:opacity-40 hover:bg-ember-deep transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {step === "age" && (
          <div className="mt-6 animate-fade-up">
            <h1 className="font-display text-2xl text-ink">One quick thing</h1>
            <p className="text-sm text-ink-soft mt-1">
              The Living Room is for adults. Please confirm you are 18 or older.
            </p>
            <label className="mt-4 flex items-start gap-3 rounded-xl border border-parchment bg-white/80 px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-ink">I confirm I am 18 years of age or older.</span>
            </label>
            <button
              disabled={!ageConfirmed}
              onClick={() => setStep("preference")}
              className="mt-4 w-full rounded-full bg-ember text-white py-3 text-sm font-medium disabled:opacity-40 hover:bg-ember-deep transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {step === "preference" && (
          <div className="mt-6 animate-fade-up">
            <h1 className="font-display text-2xl text-ink">How would you like company today?</h1>
            <div className="mt-4 flex flex-col gap-2">
              {(Object.keys(companyPreferenceLabels) as CompanyPreference[]).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setPreference(key);
                    setStep("feeling");
                  }}
                  className="text-left rounded-xl border border-parchment bg-white/80 px-4 py-3 text-sm text-ink hover:border-ember transition-colors"
                >
                  {companyPreferenceLabels[key]}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "feeling" && (
          <div className="mt-6 animate-fade-up">
            <h1 className="font-display text-2xl text-ink">How are you feeling?</h1>
            <p className="text-xs text-ink-soft mt-1">
              This just helps us suggest a room. Nothing here is a diagnosis, and you don&rsquo;t have to answer.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {(Object.keys(feelingLabels) as Feeling[]).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setFeeling(key);
                    finish(key);
                  }}
                  className="text-left rounded-xl border border-parchment bg-white/80 px-3 py-2.5 text-sm text-ink hover:border-ember transition-colors"
                >
                  {feelingLabels[key]}
                </button>
              ))}
            </div>
            <button
              onClick={() => finish(null)}
              className="mt-3 text-xs text-ink-soft hover:text-ink underline"
            >
              Skip this
            </button>
          </div>
        )}

        {step === "done" && (
          <div className="mt-6 animate-fade-up">
            <h1 className="font-display text-2xl text-ink">Good to have you here, {name || "friend"}.</h1>
            <p className="text-sm text-ink-soft mt-2">A couple of rooms that might suit you right now:</p>
            <div className="mt-4 flex flex-col gap-2">
              {suggestions.map((slug) => (
                <button
                  key={slug}
                  onClick={() => router.push(`/rooms/${slug}`)}
                  className="text-left rounded-xl border border-parchment bg-white/80 px-4 py-3 text-sm text-ink hover:border-ember transition-colors capitalize"
                >
                  {slug.replace(/-/g, " ")}
                </button>
              ))}
            </div>
            <button
              onClick={() => router.push("/rooms")}
              className="mt-4 w-full rounded-full bg-ember text-white py-3 text-sm font-medium hover:bg-ember-deep transition-colors"
            >
              Or browse every room
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
