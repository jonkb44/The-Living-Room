import { describe, it, expect } from "vitest";
import { suggestRoomSlugs, sampleRooms } from "@/lib/sampleData";

describe("suggestRoomSlugs", () => {
  it("suggests Can't Sleep and Night Owls for someone who can't sleep", () => {
    const suggestions = suggestRoomSlugs(null, "cant_sleep");
    expect(suggestions).toContain("cant-sleep");
    expect(suggestions).toContain("night-owls");
  });

  it("suggests Grief and Loss for someone feeling sad", () => {
    expect(suggestRoomSlugs(null, "sad")).toContain("grief-and-loss");
  });

  it("falls back to gentle default rooms with no signal", () => {
    const suggestions = suggestRoomSlugs(null, null);
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it("never suggests a room slug that doesn't exist", () => {
    const allSlugs = new Set(sampleRooms.map((r) => r.slug));
    const combos = suggestRoomSlugs("talk", "anxious").concat(
      suggestRoomSlugs("quiet_company", "cant_sleep"),
      suggestRoomSlugs("listen", "bored")
    );
    combos.forEach((slug) => expect(allSlugs.has(slug)).toBe(true));
  });
});

describe("sampleRooms", () => {
  it("has a unique slug per room", () => {
    const slugs = sampleRooms.map((r) => r.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every room has at least one host prompt", () => {
    sampleRooms.forEach((r) => expect(r.hostPrompts.length).toBeGreaterThan(0));
  });
});
