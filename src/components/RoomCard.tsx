import Link from "next/link";
import { Room } from "@/lib/types";

const FORMAT_LABEL: Record<Room["format"], string> = {
  quiet: "Quiet Room",
  conversation: "Conversation Room",
  activity: "Activity Room",
};

const LEVEL_DOT: Record<Room["activityLevel"], string> = {
  Quiet: "bg-quiet",
  "Gentle Conversation": "bg-lamp",
  Active: "bg-ember",
};

export default function RoomCard({
  room,
  presentCount,
}: {
  room: Room;
  presentCount: number;
}) {
  return (
    <Link
      href={`/rooms/${room.slug}`}
      className="block rounded-2xl bg-white/70 border border-parchment p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-xl text-ink">{room.name}</h3>
        <span className="text-xs text-ink-soft whitespace-nowrap rounded-full bg-linen-deep px-2.5 py-1">
          {FORMAT_LABEL[room.format]}
        </span>
      </div>
      <p className="mt-2 text-sm text-ink-soft leading-relaxed">{room.description}</p>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-ink-soft">
          <span className={`w-2 h-2 rounded-full ${LEVEL_DOT[room.activityLevel]}`} />
          {room.activityLevel}
        </span>
        <span className="text-clay font-medium">
          {presentCount === 0
            ? "Quietly empty right now"
            : `${presentCount} ${presentCount === 1 ? "person" : "people"} here`}
        </span>
      </div>
    </Link>
  );
}
