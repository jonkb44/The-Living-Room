import Link from "next/link";

const NAV_LINKS = [
  { href: "/rooms", label: "Rooms" },
  { href: "/familiar-faces", label: "Familiar Faces" },
  { href: "/messages", label: "Messages" },
  { href: "/profile", label: "Settings" },
];

export default function Header({ displayName }: { displayName?: string }) {
  return (
    <header className="border-b border-parchment bg-linen/90 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto max-w-5xl px-5 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-7 h-7 rounded-full bg-lamp presence-glow" aria-hidden />
          <span className="font-display text-lg tracking-tight text-ink group-hover:text-ember-deep transition-colors">
            The Living Room
          </span>
        </Link>
        <nav className="hidden sm:flex items-center gap-5 text-sm text-ink-soft">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ember-deep transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {displayName ? (
            <span className="text-sm text-ink-soft hidden sm:inline">Hi, {displayName}</span>
          ) : null}
          <Link
            href="/profile"
            className="w-8 h-8 rounded-full bg-parchment flex items-center justify-center text-sm font-medium text-clay"
          >
            {displayName ? displayName[0].toUpperCase() : "?"}
          </Link>
        </div>
      </div>
    </header>
  );
}
