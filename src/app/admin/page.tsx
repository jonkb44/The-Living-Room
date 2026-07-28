import Header from "@/components/Header";
import { sampleRooms } from "@/lib/sampleData";

// Access to this page should be restricted server-side to
// user_profiles.role = 'admin'. Not enforced in this prototype.
export default function AdminDashboard() {
  const stats = [
    { label: "Active rooms", value: sampleRooms.length },
    { label: "Reports (7 days)", value: 6 },
    { label: "Suspended users", value: 1 },
    { label: "New signups (7 days)", value: 42 },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-4xl px-5 py-10">
        <h1 className="font-display text-3xl text-ink">Admin dashboard</h1>
        <p className="text-sm text-ink-soft mt-1">A basic operational overview.</p>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-parchment bg-white/70 p-4">
              <p className="text-2xl font-display text-ink">{s.value}</p>
              <p className="text-xs text-ink-soft mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="font-display text-xl text-ink mb-3">Rooms</h2>
          <div className="rounded-2xl border border-parchment bg-white/70 divide-y divide-parchment">
            {sampleRooms.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-ink">{r.name}</span>
                <span className="text-ink-soft">{r.format}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
