import Header from "@/components/Header";

const STANDARDS = [
  {
    title: "You never have to talk",
    body: "Silence is a complete way to be in a room here. No one will chase you for a reply.",
  },
  {
    title: "No pressure to meet, share contact details, or move platforms",
    body: "Phone numbers, addresses and financial details are not permitted in public rooms. We'll warn you before you accidentally share obvious contact details.",
  },
  {
    title: "This is not a dating space",
    body: "Romantic or sexual advances toward someone who hasn't invited them are treated as harassment.",
  },
  {
    title: "Be someone worth sitting near",
    body: "Harassment, hate speech, threats and scams result in warnings, suspension or a permanent ban.",
  },
  {
    title: "This isn't a crisis service",
    body: "If you or someone else seems to be in immediate danger, we'll point you toward local emergency or crisis support. We aren't a substitute for it.",
  },
  {
    title: "You're in control",
    body: "Mute, block or report anyone, any time, with no explanation required.",
  },
];

export default function CommunityStandardsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-2xl px-5 py-10">
        <h1 className="font-display text-3xl text-ink">Community standards</h1>
        <p className="text-sm text-ink-soft mt-2">
          A short version of what keeps this a safe, low-pressure place.
        </p>
        <div className="mt-6 flex flex-col gap-5">
          {STANDARDS.map((s) => (
            <div key={s.title}>
              <h2 className="font-display text-lg text-ink">{s.title}</h2>
              <p className="text-sm text-ink-soft mt-1 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
