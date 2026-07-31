"use client";

import { useEffect, useState } from "react";
import { createClient } from "./client";

// Ensures the visitor has a Supabase auth session (anonymous sign-in for
// guests) and a matching row in user_profiles, then returns that profile.
// This replaces src/lib/session.ts as the real, shared-across-visitors
// identity once Supabase is connected.
//
// Requires "Allow anonymous sign-ins" to be turned on in the Supabase
// dashboard under Authentication > Providers.

export interface SupabaseProfile {
  id: string;
  displayName: string;
}

export function useSupabaseIdentity(preferredName?: string) {
  const [profile, setProfile] = useState<SupabaseProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function ensureIdentity() {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        let authUserId = sessionData.session?.user?.id;

        if (!authUserId) {
          const { data, error: signInError } = await supabase.auth.signInAnonymously();
          if (signInError) throw signInError;
          authUserId = data.user?.id;
        }
        if (!authUserId) throw new Error("Could not establish a session.");

        const { data: existing, error: fetchError } = await supabase
          .from("user_profiles")
          .select("id, display_name")
          .eq("auth_user_id", authUserId)
          .maybeSingle();
        if (fetchError) throw fetchError;

        if (existing) {
          if (!cancelled) {
            setProfile({ id: existing.id, displayName: existing.display_name });
            setLoading(false);
          }
          return;
        }

        const name = preferredName?.trim() || "Guest";
        const { data: created, error: insertError } = await supabase
          .from("user_profiles")
          .insert({
            auth_user_id: authUserId,
            display_name: name,
            is_guest: true,
            is_over_18_confirmed: true,
          })
          .select("id, display_name")
          .single();
        if (insertError) throw insertError;

        if (!cancelled) {
          setProfile({ id: created.id, displayName: created.display_name });
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Something went wrong connecting.");
          setLoading(false);
        }
      }
    }

    ensureIdentity();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run once per mount; renaming happens via updateDisplayName below
  }, []);

  return { profile, loading, error };
}
