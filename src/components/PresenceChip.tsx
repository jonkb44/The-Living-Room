import { RoomPresenceEntry, PresenceActivity } from "@/lib/types";

const ACTIVITY_LABEL: Record<PresenceActivity, string> = {
  coffee: "having coffee",
  reading: "reading",
  cooking: "cooking",
  watching_tv: "watching television",
  working: "working",
  listening_to_music: "listening to music",
  resting: "resting",
  trying_to_sleep: "trying to sleep",
  just_sitting: "just sitting here",
};

export default function PresenceChip({ entry }: { entry: RoomPresenceEntry }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/70 border border-parchment pl-1.5 pr-3 py-1.5">
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium text-white ${
          entry.isQuiet ? "bg-moss/70" : "bg-clay"
        }`}
      >
        {entry.displayName[0].toUpperCase()}
      </span>
      <span className="text-sm text-ink">
        {entry.displayName}
        {entry.isQuiet ? (
          <span className="text-ink-soft"> — sitting quietly</span>
        ) : entry.activity ? (
          <span className="text-ink-soft"> — {ACTIVITY_LABEL[entry.activity]}</span>
        ) : null}
      </span>
    </div>
  );
}
