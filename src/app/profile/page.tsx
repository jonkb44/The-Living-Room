"use client";
import Header from "@/components/Header";
import { useLocalSession } from "@/lib/session";
import { useSupabaseIdentity } from "@/lib/supabase/identity";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { session, update, clear, loaded } = useLocalSession();
  const { profile } = useSupabaseIdentity(session.displayName);
  const [shareStatus, setShareStatus] = useState(false);

  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [notifyLoaded, setNotifyLoaded] = useState(false);
  const [notifySaving, setNotifySaving] = useState(false);
  const [notifySaved, setNotifySaved] = useState(false);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    async function loadNotifyPrefs() {
      const supabase = createClient();
      const { data } = await supabase
        .from("user_profiles")
        .select("notification_email, notify_on_reply")
        .eq("id", profile!.id)
        .maybeSingle();
      if (!cancelled && data) {
        setNotifyEmail(data.notification_email ?? "");
        setNotifyEnabled(data.notify_on_reply ?? false);
        setNotifyLoaded(true);
      }
    }
    loadNotifyPrefs();
    return () => {
      cancelled = true;
    };
  }, [profile]);

  async function saveNotifyPrefs(nextEnabled: boolean, nextEmail: string) {
    if (!profile) return;
    setNotifySaving(true);
    setNotifySaved(false);
    const supabase = createClient();
    const { error } = await supabase
      .from("user_profiles")
      .update({
        notify_on_reply: nextEnabled,
        notification_email: nextEmail.trim() || null,
      })
      .eq("id", profile.id);
    setNotifySaving(false);
    if (!error) setNotifySaved(true);
  }

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

        <div className="mt-4 rounded-2xl border border-parchment bg-white/70 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink">Email me when someone replies</p>
              <p className="text-xs text-ink-soft">
                Optional. Only sent when someone replies directly to one of your messages.
              </p>
            </div>
            <button
              onClick={() => {
                const next = !notifyEnabled;
                setNotifyEnabled(next);
                saveNotifyPrefs(next, notifyEmail);
              }}
              disabled={!profile}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                notifyEnabled ? "bg-ember" : "bg-parchment"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  notifyEnabled ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {notifyEnabled && (
            <div className="mt-4">
              <label className="text-xs text-ink-soft">Email address</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="email"
                  value={notifyEmail}
                  onChange={(e) => {
                    setNotifyEmail(e.target.value);
                    setNotifySaved(false);
                  }}
                  onBlur={() => saveNotifyPrefs(notifyEnabled, notifyEmail)}
                  placeholder="you@example.com"
                  className="flex-1 rounded-xl border border-parchment bg-white px-3 py-2 text-sm outline-none focus:border-ember"
                />
              </div>
              {notifySaving && <p className="text-xs text-ink-soft mt-1">Saving…</p>}
              {notifySaved && !notifySaving && (
                <p className="text-xs text-moss mt-1">Saved.</p>
              )}
              {!notifyLoaded && <p className="text-xs text-ink-soft mt-1">Loading…</p>}
            </div>
          )}
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
