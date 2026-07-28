"use client";

import { useEffect, useState, useCallback } from "react";
import { CompanyPreference, Feeling } from "./types";

// Lightweight client-side session used by this prototype so the UI feels
// continuous across pages without a live Supabase backend wired in yet.
//
// In production, replace this with real Supabase auth:
//   - Guests: supabase.auth.signInAnonymously()
//   - Members: supabase.auth.signUp / signInWithPassword / signInWithOtp
// and store companyPreference / currentFeeling / displayName on the
// user_profiles row (see supabase/schema.sql) instead of localStorage.

export interface LocalSession {
  displayName: string;
  isGuest: boolean;
  companyPreference: CompanyPreference | null;
  currentFeeling: Feeling | null;
  ageConfirmed: boolean;
}

const STORAGE_KEY = "living-room:session";

const EMPTY_SESSION: LocalSession = {
  displayName: "",
  isGuest: true,
  companyPreference: null,
  currentFeeling: null,
  ageConfirmed: false,
};

export function useLocalSession() {
  const [session, setSession] = useState<LocalSession>(EMPTY_SESSION);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from an external store (localStorage) on mount
      if (raw) setSession(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setLoaded(true);
  }, []);

  const update = useCallback((patch: Partial<LocalSession>) => {
    setSession((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore write failures (private browsing, etc.)
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setSession(EMPTY_SESSION);
  }, []);

  return { session, update, clear, loaded };
}
