import Link from "next/link";
import Header from "@/components/Header";
import RoomCard from "@/components/RoomCard";
import { sampleRooms, samplePresenceByRoom } from "@/lib/sampleData";

export default function LandingPage() {
  const featured = sampleRooms.slice(0, 6);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-5">
        <section className="pt-16 pb-14 text-center">
          <h1 className="font-display text-4xl sm:text-5xl leading-tight text-ink max-w-2xl mx-auto">
            You don&rsquo;t have to be alone just because you want to stay home.
          </h1>
          <p className="mt-5 text-ink-soft max-w-xl mx-auto leading-relaxed">
            Enter a room, see who is around, say hello or simply stay quietly.
            There is no pressure to perform, make plans or explain yourself.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/onboarding"
              className="rounded-full bg-ember text-white px-6 py-3 text-sm font-medium hover:bg-ember-deep transition-colors shadow-sm"
            >
              Enter The Living Room
            </Link>
            <Link
              href="/rooms"
              className="rounded-full px-6 py-3 text-sm font-medium text-ink-soft hover:text-ink transition-colors"
            >
              Look around first
            </Link>
          </div>
          <p className="mt-6 text-xs text-ink-soft/70">
            Not a dating app. No swiping, no follower counts, no obligation to speak.
          </p>
        </section>

        <section className="pb-20">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-2xl text-ink">A few rooms, right now</h2>
            <Link href="/rooms" className="text-sm text-clay hover:text-ember-deep">
              See all rooms →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                presentCount={samplePresenceByRoom[room.id]?.length ?? 0}
              />
            ))}
          </div>
        </section>

        <section className="pb-24 grid sm:grid-cols-3 gap-6 text-sm text-ink-soft">
          <div>
            <h3 className="font-display text-lg text-ink mb-1">Silence is allowed here</h3>
            <p>Sit quietly, be seen, say nothing. That&rsquo;s a complete way to spend time here.</p>
          </div>
          <div>
            <h3 className="font-display text-lg text-ink mb-1">Come and go freely</h3>
            <p>Five minutes or the whole evening. Leave whenever you like, no explanation needed.</p>
          </div>
          <div>
            <h3 className="font-display text-lg text-ink mb-1">Nothing to build or perform</h3>
            <p>No profile to curate, no streaks, no popularity. Just company.</p>
          </div>
        </section>
      </main>
      <footer className="border-t border-parchment py-8 text-center text-xs text-ink-soft/70">
        <div className="flex items-center justify-center gap-4">
          <Link href="/community-standards">Community standards</Link>
          <span>·</span>
          <Link href="/profile">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
