"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-display text-2xl text-ink">Join The Living Room</h1>
        <p className="text-sm text-ink-soft mt-2">
          An email keeps your Familiar Faces and settings if you come back on another
          device. You can also stay as a guest — no email needed.
        </p>

        <div className="mt-6 rounded-2xl border border-parchment bg-white/70 p-5 text-left">
          <label className="text-xs text-ink-soft">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="mt-1 w-full rounded-xl border border-parchment bg-white px-3 py-2 text-sm outline-none focus:border-ember"
          />
          <button
            onClick={() => router.push("/onboarding")}
            className="mt-3 w-full rounded-full bg-ember text-white py-2.5 text-sm font-medium hover:bg-ember-deep transition-colors"
          >
            Send me a sign-in link
          </button>
          <p className="text-[11px] text-ink-soft mt-2">
            No password to remember. We&rsquo;ll email a one-time link
            (Supabase magic-link auth in production).
          </p>
        </div>

        <div className="mt-4">
          <button
            onClick={() => router.push("/onboarding")}
            className="text-sm text-ink-soft hover:text-ink underline"
          >
            Continue as a guest instead
          </button>
        </div>

        <p className="mt-6 text-xs text-ink-soft/70">
          By continuing you agree to our{" "}
          <Link href="/community-standards" className="underline">
            community standards
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
