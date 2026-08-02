// Shared domain types for The Living Room.
// These mirror the tables defined in supabase/schema.sql.

export type RoomFormat = "quiet" | "conversation" | "activity";

export type RoomSituation =
  | "divorced"
  | "retired"
  | "empty_nest"
  | "widowed"
  | "career_loss"
  | "general";

export type ActivityLevel = "Quiet" | "Gentle Conversation" | "Active";

export type CompanyPreference =
  | "talk"
  | "listen"
  | "quiet_company"
  | "not_sure";

export type Feeling =
  | "fine_alone"
  | "a_little_flat"
  | "restless"
  | "anxious"
  | "sad"
  | "tired"
  | "bored"
  | "cant_sleep"
  | "rather_not_say";

export type PresenceActivity =
  | "coffee"
  | "reading"
  | "cooking"
  | "watching_tv"
  | "working"
  | "listening_to_music"
  | "resting"
  | "trying_to_sleep"
  | "just_sitting";

export type UserRole = "guest" | "member" | "host" | "moderator" | "admin";

export type ReportCategory =
  | "harassment"
  | "romantic_advances"
  | "hate_speech"
  | "scam_or_money"
  | "inappropriate_content"
  | "threatening_behaviour"
  | "self_harm_concern"
  | "other";

export interface UserProfile {
  id: string;
  displayName: string;
  isGuest: boolean;
  companyPreference: CompanyPreference | null;
  currentFeeling: Feeling | null;
  role: UserRole;
  timezoneRegion: string | null;
  shareOnlineStatus: boolean;
  createdAt: string;
}

export interface Room {
  id: string;
  slug: string;
  name: string;
  description: string;
  format: RoomFormat;
  activityLevel: ActivityLevel;
  situation: RoomSituation;
  hostId: string | null;
  hostPrompts: string[];
  isActive: boolean;
}

export interface RoomPresenceEntry {
  userId: string;
  displayName: string;
  activity: PresenceActivity | null;
  isQuiet: boolean;
  joinedAt: string;
}

export interface RoomMessage {
  id: string;
  roomId: string;
  authorId: string;
  authorDisplayName: string;
  body: string;
  createdAt: string;
  isSystemMessage?: boolean;
  isHostPrompt?: boolean;
  parentMessageId?: string | null;
}

export const ROOM_SITUATION_LABELS: Record<RoomSituation, string> = {
  divorced: "Starting Over",
  retired: "The Quiet After",
  empty_nest: "The House Feels Different",
  widowed: "Missing Someone",
  career_loss: "What Now",
  general: "The Living Room",
};

export type ReactionKind = "heart" | "smile" | "wave" | "understand";

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  kind: ReactionKind;
}

export interface MutualConnection {
  id: string;
  userAId: string;
  userBId: string;
  createdAt: string;
}

export interface PendingInterest {
  fromUserId: string;
  toUserId: string;
  roomId: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  roomId: string | null;
  category: ReportCategory;
  details: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  createdAt: string;
}
