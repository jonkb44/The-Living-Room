# The Living Room

A social presence app for people who want to be near other people without
dating, networking, or performing. No swiping, no follower counts, no
obligation to speak.

## What's in this MVP

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4. All pages listed in
the brief exist and are wired together:

- Landing page
- Sign-up / guest entry (`/signup`)
- Onboarding — name, age confirmation, company preference, feeling (`/onboarding`)
- Room directory with format filters (`/rooms`)
- Individual room — presence, chat, reactions, quiet mode, host prompts,
  "see again", report/block (`/rooms/[slug]`)
- Familiar Faces (`/familiar-faces`)
- Private messages (`/messages`)
- Profile & privacy settings (`/profile`)
- Community standards (`/community-standards`)
- Standalone report flow (`/report`)
- Moderator dashboard (`/moderator`)
- Admin dashboard (`/admin`)

18 sample rooms across all three formats (Quiet, Conversation, Activity)
are included, matching the brief.

## Important assumption — read this first

**The UI in this build runs on local sample data and a `localStorage`
session, not a live database.** This was the only way to hand you a fully
interactive, deployable prototype without provisioning infrastructure on
your behalf. Concretely:

- `src/lib/sampleData.ts` holds the 18 rooms, demo presence, and demo
  messages shown in the directory and inside rooms.
- `src/lib/session.ts` is a small hook that stores your display name and
  onboarding answers in the browser so the app feels continuous across
  pages, standing in for real auth.
- Posting a message, reacting, toggling quiet mode, and "see this person
  again" all update local React state — they work, but only for you, in
  your own browser tab, and reset if you clear storage.

**`supabase/schema.sql` and `supabase/seed.sql` define the real,
production-shaped database** — every table from the brief (`users`,
`user_profiles`, `rooms`, `room_presence`, `messages`,
`message_reactions`, `reports`, `blocks`, `mutual_connections`,
`private_messages`, `moderation_actions`, `notification_preferences`,
etc.), with Row Level Security policies and a trigger that automatically
creates a `mutual_connections` row when two people both express interest
in seeing each other again (so a "Familiar Face" is never revealed
one-sided). Wiring the pages to it is the next milestone — see "Next
steps" below. This order was deliberate: a working, good-looking
prototype now, on a schema that won't need to change shape later.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm run test    # runs the automated test suite (Vitest)
npm run lint     # ESLint
npm run build    # production build
```

## Connecting real Supabase (next milestone)

1. Create a project at supabase.com.
2. In the SQL editor, run `supabase/schema.sql`, then `supabase/seed.sql`.
3. Copy `.env.example` to `.env.local` and fill in your project's URL and
   anon key (Project Settings > API).
4. `src/lib/supabase/client.ts` and `src/lib/supabase/server.ts` are
   already set up to read those env vars.
5. Replace the sample-data reads in `src/app/rooms/page.tsx` and
   `src/app/rooms/[slug]/page.tsx` with Supabase queries, and swap
   `useLocalSession` for real Supabase Auth (anonymous sign-in for
   guests, magic-link or email/password for members). Every place this
   needs to happen is flagged with an `// In production:` comment in the
   relevant file.
6. For live presence and chat, use a Supabase Realtime channel per room
   (Postgres Changes on `room_presence` and `messages`, or Presence for
   the "who's here" list) instead of local React state.

## Deployment

This is a standard Next.js app — deploy it to Vercel:

1. Push this project to a GitHub repo.
2. Import it at vercel.com/new.
3. Add the two Supabase env vars from `.env.example` in Vercel's project
   settings once you've connected a real database.
4. Deploy.

Netlify, Cloudflare Pages, or your own Node host will also work with
minor config; Vercel is the path of least resistance for Next.js.

## Product and safety decisions made in your absence

Per the brief, where something was unclear the simplest sensible MVP path
was chosen rather than asking repeatedly:

- Age gate: a self-attestation checkbox at onboarding ("I confirm I am
  18+"), not identity verification — standard for an MVP, but not a
  robust safety control at scale.
- Self-harm handling: a lightweight client-side keyword check on outgoing
  messages shows a supportive, non-clinical message with a crisis line
  and does not block sending. This needs a real, server-side,
  continuously maintained detection system before launch — what's here
  is a placeholder that shows the intended UX.
- Contact-detail warnings: not implemented in this build (the brief asks
  for a warning before someone shares a phone number or address in a
  public room). Good candidate for a Supabase Edge Function running a
  regex/heuristic check server-side on message insert, since it needs to
  be enforced, not just suggested client-side.
- Familiar Faces reveal logic: fully implemented at the database level
  (the trigger in schema.sql) so one-sided interest can't leak to the
  other person, even by accident.
- Moderator/admin access control: the dashboard pages exist and are
  functional UI, but role-based route protection (only letting
  moderator/admin users load them) is not yet enforced — a
  straightforward addition once real auth is in place.
- Fonts: system font stack instead of a hosted Google Font, so the build
  has no external network dependency and stays fast and reliable
  wherever you deploy it.

## Project structure

```
src/
  app/                  Pages (App Router)
  components/           Reusable UI (RoomCard, PresenceChip, MessageBubble, ReactionBar, Header)
  lib/
    types.ts            Domain types shared across the app
    sampleData.ts       Demo rooms, presence, messages, onboarding logic
    session.ts          Local session hook (stand-in for real auth)
    supabase/            Browser + server Supabase clients (ready, unused until step above)
supabase/
  schema.sql             Full production schema + RLS policies + Familiar Faces trigger
  seed.sql                Sample rooms matching sampleData.ts, for a real database
```
