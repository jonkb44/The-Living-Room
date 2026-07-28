import { Room, RoomPresenceEntry, RoomMessage, CompanyPreference, Feeling } from "./types";

// This file provides realistic sample data so the app looks and feels
// finished in the browser before a real Supabase project is connected.
// Once Supabase env vars are set, the pages in src/app can be switched
// to fetch from the database instead (see supabase/schema.sql + seed.sql,
// which mirror this same content so real data matches the demo).

export const sampleRooms: Room[] = [
  {
    id: "r1",
    slug: "morning-coffee",
    name: "Morning Coffee",
    description: "A slow start, together. Come as you are, before the day gets loud.",
    format: "conversation",
    activityLevel: "Gentle Conversation",
    hostId: "host-mara",
    hostPrompts: [
      "What are you drinking this morning?",
      "One ordinary thing you're looking forward to today?",
    ],
    isActive: true,
  },
  {
    id: "r2",
    slug: "quiet-company",
    name: "Quiet Company",
    description: "No topic, no agenda. Just people sitting nearby.",
    format: "quiet",
    activityLevel: "Quiet",
    hostId: null,
    hostPrompts: ["No need to say anything. You're welcome to simply stay."],
    isActive: true,
  },
  {
    id: "r3",
    slug: "watching-television",
    name: "Watching Television",
    description: "Everyone has something on in the background. Say what, or don't.",
    format: "activity",
    activityLevel: "Quiet",
    hostId: null,
    hostPrompts: ["What's on your screen tonight?"],
    isActive: true,
  },
  {
    id: "r4",
    slug: "reading-together",
    name: "Reading Together",
    description: "Bring your book. Read in company, look up when you feel like it.",
    format: "activity",
    activityLevel: "Quiet",
    hostId: "host-tomas",
    hostPrompts: ["What are you reading at the moment?"],
    isActive: true,
  },
  {
    id: "r5",
    slug: "working-from-home",
    name: "Working From Home",
    description: "A shared desk, without the small talk. Just company while you work.",
    format: "quiet",
    activityLevel: "Quiet",
    hostId: null,
    hostPrompts: ["Wave if you're heads-down. No explanation needed."],
    isActive: true,
  },
  {
    id: "r6",
    slug: "cooking-dinner",
    name: "Cooking Dinner",
    description: "Chop, stir, taste. Company for the part of the evening that's often solitary.",
    format: "activity",
    activityLevel: "Gentle Conversation",
    hostId: null,
    hostPrompts: ["What's on the stove tonight?"],
    isActive: true,
  },
  {
    id: "r7",
    slug: "night-owls",
    name: "Night Owls",
    description: "For the people still awake when the rest of the house is quiet.",
    format: "conversation",
    activityLevel: "Gentle Conversation",
    hostId: "host-priya",
    hostPrompts: ["What's keeping you up tonight? No need to answer."],
    isActive: true,
  },
  {
    id: "r8",
    slug: "cant-sleep",
    name: "Can't Sleep",
    description: "A low-lit room for the hours that feel longest alone.",
    format: "quiet",
    activityLevel: "Quiet",
    hostId: null,
    hostPrompts: ["You don't have to explain why you're awake."],
    isActive: true,
  },
  {
    id: "r9",
    slug: "gardening",
    name: "Gardening",
    description: "Dirt under your nails or just a windowsill pot. Company while you tend to something.",
    format: "activity",
    activityLevel: "Gentle Conversation",
    hostId: null,
    hostPrompts: ["What are you growing, or trying to?"],
    isActive: true,
  },
  {
    id: "r10",
    slug: "music-in-the-background",
    name: "Music in the Background",
    description: "Everyone's got something playing. Share it or just listen along.",
    format: "activity",
    activityLevel: "Gentle Conversation",
    hostId: null,
    hostPrompts: ["What's playing for you right now?"],
    isActive: true,
  },
  {
    id: "r11",
    slug: "sunday-afternoon",
    name: "Sunday Afternoon",
    description: "That particular stillness before the week starts again.",
    format: "quiet",
    activityLevel: "Quiet",
    hostId: null,
    hostPrompts: ["No need to answer. You are welcome to simply stay."],
    isActive: true,
  },
  {
    id: "r12",
    slug: "living-alone",
    name: "Living Alone",
    description: "For the quiet of a home with just you in it.",
    format: "conversation",
    activityLevel: "Gentle Conversation",
    hostId: "host-mara",
    hostPrompts: ["What does your evening routine look like?"],
    isActive: true,
  },
  {
    id: "r13",
    slug: "recently-retired",
    name: "Recently Retired",
    description: "The days look different now. Company for that adjustment.",
    format: "conversation",
    activityLevel: "Gentle Conversation",
    hostId: null,
    hostPrompts: ["What's surprised you most about the new pace?"],
    isActive: true,
  },
  {
    id: "r14",
    slug: "carers-corner",
    name: "Carers' Corner",
    description: "For the people looking after someone else. A room that asks nothing of you.",
    format: "quiet",
    activityLevel: "Quiet",
    hostId: "host-priya",
    hostPrompts: ["Say hello with a wave if you don't feel like talking."],
    isActive: true,
  },
  {
    id: "r15",
    slug: "recovering-at-home",
    name: "Recovering at Home",
    description: "Company while you rest and mend, at whatever pace that takes.",
    format: "quiet",
    activityLevel: "Quiet",
    hostId: null,
    hostPrompts: ["You are welcome to simply stay."],
    isActive: true,
  },
  {
    id: "r16",
    slug: "grief-and-loss",
    name: "Grief and Loss",
    description: "A gentle room for the weight of missing someone. No need to explain.",
    format: "quiet",
    activityLevel: "Quiet",
    hostId: "host-tomas",
    hostPrompts: ["No need to say anything. You are welcome to simply stay."],
    isActive: true,
  },
  {
    id: "r17",
    slug: "new-to-the-city",
    name: "New to the City",
    description: "For the early, disorienting weeks somewhere unfamiliar.",
    format: "conversation",
    activityLevel: "Gentle Conversation",
    hostId: null,
    hostPrompts: ["What's one thing you're still finding your way around?"],
    isActive: true,
  },
  {
    id: "r18",
    slug: "just-need-company",
    name: "Just Need Company",
    description: "No theme. Sometimes that's exactly what's needed.",
    format: "quiet",
    activityLevel: "Quiet",
    hostId: null,
    hostPrompts: ["Come in for five minutes or stay all evening."],
    isActive: true,
  },
];

export const samplePresenceByRoom: Record<string, RoomPresenceEntry[]> = {
  r1: [
    { userId: "u1", displayName: "Ren", activity: "coffee", isQuiet: false, joinedAt: new Date().toISOString() },
    { userId: "u2", displayName: "Bel", activity: "coffee", isQuiet: true, joinedAt: new Date().toISOString() },
    { userId: "u3", displayName: "Otis", activity: "just_sitting", isQuiet: false, joinedAt: new Date().toISOString() },
  ],
  r2: [
    { userId: "u4", displayName: "Sana", activity: "resting", isQuiet: true, joinedAt: new Date().toISOString() },
    { userId: "u5", displayName: "Marlow", activity: "just_sitting", isQuiet: true, joinedAt: new Date().toISOString() },
  ],
  r7: [
    { userId: "u6", displayName: "Wren", activity: "listening_to_music", isQuiet: false, joinedAt: new Date().toISOString() },
    { userId: "u7", displayName: "Idris", activity: "working", isQuiet: false, joinedAt: new Date().toISOString() },
  ],
};

export const sampleMessagesByRoom: Record<string, RoomMessage[]> = {
  r1: [
    {
      id: "m1",
      roomId: "r1",
      authorId: "system",
      authorDisplayName: "The Room",
      body: "Ren has joined us. There is no need to say anything.",
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      isSystemMessage: true,
    },
    {
      id: "m2",
      roomId: "r1",
      authorId: "u1",
      authorDisplayName: "Ren",
      body: "Second coffee already. It's that kind of morning.",
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: "m3",
      roomId: "r1",
      authorId: "u3",
      authorDisplayName: "Otis",
      body: "No judgement here, I'm on my third.",
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
    {
      id: "m4",
      roomId: "r1",
      authorId: "host-mara",
      authorDisplayName: "Mara (host)",
      body: "What's one ordinary thing you're looking forward to today?",
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      isHostPrompt: true,
    },
  ],
  r2: [
    {
      id: "m5",
      roomId: "r2",
      authorId: "system",
      authorDisplayName: "The Room",
      body: "Sana is enjoying quiet company.",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isSystemMessage: true,
    },
  ],
};

export const companyPreferenceLabels: Record<CompanyPreference, string> = {
  talk: "I would like to talk",
  listen: "I am happy to listen",
  quiet_company: "I would prefer quiet company",
  not_sure: "I am not sure",
};

export const feelingLabels: Record<Feeling, string> = {
  fine_alone: "Fine, just alone",
  a_little_flat: "A little flat",
  restless: "Restless",
  anxious: "Anxious",
  sad: "Sad",
  tired: "Tired",
  bored: "Bored",
  cant_sleep: "I can't sleep",
  rather_not_say: "I would rather not say",
};

// Very small heuristic used purely to pick a friendly first suggestion
// in onboarding. This is not a diagnostic or clinical tool of any kind.
export function suggestRoomSlugs(
  preference: CompanyPreference | null,
  feeling: Feeling | null
): string[] {
  if (feeling === "cant_sleep") return ["cant-sleep", "night-owls"];
  if (feeling === "sad") return ["grief-and-loss", "quiet-company"];
  if (feeling === "anxious") return ["quiet-company", "reading-together"];
  if (preference === "quiet_company") return ["quiet-company", "sunday-afternoon"];
  if (preference === "talk") return ["morning-coffee", "night-owls"];
  if (preference === "listen") return ["cooking-dinner", "gardening"];
  return ["just-need-company", "quiet-company"];
}
