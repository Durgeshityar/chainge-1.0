/**
 * Domain Types for Chainge
 *
 * These types define all domain entities used throughout the application.
 * They are designed to be compatible with Prisma-generated types once
 * the database schema is set up in Phase 15.
 */
// ==================== ENUMS ====================

export enum ActivityStatus {
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum Visibility {
  PUBLIC = 'PUBLIC',
  FOLLOWERS = 'FOLLOWERS',
  PRIVATE = 'PRIVATE',
}

export enum ParticipantStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
}

export enum ChatType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
}

export enum NotificationType {
  JOIN_REQUEST = 'JOIN_REQUEST',
  JOIN_APPROVED = 'JOIN_APPROVED',
  JOIN_DECLINED = 'JOIN_DECLINED',
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  FOLLOW = 'FOLLOW',
  MESSAGE = 'MESSAGE',
  // New types for extended UI
  MATCH = 'MATCH',
  CONNECTION_REQUEST = 'CONNECTION_REQUEST',
  EVENT_REMINDER = 'EVENT_REMINDER',
}

// ==================== BASE TYPES ====================

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== USER ====================

export interface User extends Omit<BaseEntity, 'updatedAt'> {
  email: string;
  username: string;
  name: string; // Added for display name in profile
  coverImage?: string; // Added for profile cover
  // displayName: string | null; // Consider deprecating or mapping 'name' to this if backend schema differs
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  interests: string[];
  latitude: number | null;
  longitude: number | null;
  followerCount: number;
  followingCount: number;
  createdAt: Date;
  updatedAt: Date;
  gender?: string;
  height?: string;
  weight?: string;
  age?: number; // Added for profile
  location?: string; // Added for profile
  activityTracker?: string;
  dateOfBirth?: string;
}

export type UserCreateInput = Omit<
  User,
  'id' | 'createdAt' | 'updatedAt' | 'followerCount' | 'followingCount'
> & {
  followerCount?: number;
  followingCount?: number;
};

export type UserUpdateInput = Partial<Omit<User, 'id' | 'email' | 'createdAt' | 'updatedAt'>>;

// ==================== FOLLOW ====================

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export type FollowCreateInput = Omit<Follow, 'id' | 'createdAt'>;

// ==================== ACTIVITY ====================

export interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp: Date;
  altitude?: number;
  speed?: number;
}

export interface ActivityStats {
  distance?: number; // in meters
  duration?: number; // in seconds
  pace?: number; // seconds per km
  calories?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
}

export interface Activity extends BaseEntity {
  userId: string;
  activityType: string;
  status: ActivityStatus;
  scheduledAt: Date | null;
  startedAt: Date | null;
  endedAt: Date | null;
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  routeData: RoutePoint[] | null;
  stats: ActivityStats | null;
  visibility: Visibility;
}

export type ActivityCreateInput = Omit<Activity, 'id' | 'createdAt' | 'updatedAt'> & {
  status?: ActivityStatus;
  visibility?: Visibility;
};

export type ActivityUpdateInput = Partial<
  Omit<Activity, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>;

// ==================== ACTIVITY PARTICIPANT ====================

export interface ActivityParticipant {
  id: string;
  activityId: string;
  userId: string;
  status: ParticipantStatus;
  createdAt: Date;
}

export type ActivityParticipantCreateInput = Omit<ActivityParticipant, 'id' | 'createdAt'> & {
  status?: ParticipantStatus;
};

// ==================== POST ====================

export interface Post {
  id: string;
  userId: string;
  activityId: string | null;
  caption: string | null;
  mediaUrls: string[];
  mapSnapshotUrl: string | null;
  stats: ActivityStats | null;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt?: Date;
}

export type PostCreateInput = Omit<Post, 'id' | 'createdAt' | 'likeCount' | 'commentCount'> & {
  likeCount?: number;
  commentCount?: number;
};

export type PostUpdateInput = Partial<Omit<Post, 'id' | 'userId' | 'createdAt'>>;

// ==================== POST LIKE ====================

export interface PostLike {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
}

export type PostLikeCreateInput = Omit<PostLike, 'id' | 'createdAt'>;

// ==================== POST COMMENT ====================

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

export type PostCommentCreateInput = Omit<PostComment, 'id' | 'createdAt'>;

// ==================== CHAT ====================

export interface Chat {
  id: string;
  type: ChatType;
  name: string | null;
  lastMessageId: string | null;
  isMatched?: boolean; // Optional flag for matched DM styling in mock data
  createdAt: Date;
  updatedAt: Date;
}

export type ChatCreateInput = Omit<Chat, 'id' | 'createdAt' | 'updatedAt' | 'lastMessageId'> & {
  lastMessageId?: string | null;
};

// ==================== CHAT PARTICIPANT ====================

export interface ChatParticipant {
  id: string;
  chatId: string;
  userId: string;
  joinedAt: Date;
  lastReadAt: Date | null;
}

export type ChatParticipantCreateInput = Omit<ChatParticipant, 'id' | 'joinedAt' | 'lastReadAt'> & {
  lastReadAt?: Date | null;
};

// ==================== MESSAGE ====================

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  mediaUrls?: string[];
  createdAt: Date;
}

export type MessageCreateInput = Omit<Message, 'id' | 'createdAt'> & {
  mediaUrls?: string[];
};

// ==================== NOTIFICATION ====================

export interface NotificationData {
  entityId?: string;
  entityType?: string;
  userId?: string;
  [key: string]: unknown;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: NotificationData | null;
  read: boolean;
  createdAt: Date;
}

// ==================== ACTIVITY TRACKING (FRONTEND) ====================

export enum ActivityTrackingStatus {
  IDLE = 'IDLE',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
}

export interface TrackPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface ActivitySessionMeta {
  activityType: string;
  visibility?: Visibility;
  title?: string;
  scheduledAt?: Date | null;
}

export interface ActivitySession {
  id: string;
  status: ActivityTrackingStatus;
  startedAt: number;
  endedAt: number | null;
  pausedAt: number | null;
  totalPausedMs: number;
  meta: ActivitySessionMeta;
}

export interface ActivitySummary {
  sessionId: string;
  startedAt: number;
  endedAt: number;
  distanceMeters: number;
  durationMs: number;
  paceSecondsPerKm: number | null;
  trackPoints: TrackPoint[];
}

export type NotificationCreateInput = Omit<Notification, 'id' | 'createdAt' | 'read'> & {
  read?: boolean;
};

// ==================== EXTENDED TYPES (WITH RELATIONS) ====================

export interface UserWithFollows extends User {
  followers?: Follow[];
  following?: Follow[];
}

export interface ActivityWithParticipants extends Activity {
  user?: User;
  participants?: (ActivityParticipant & { user?: User })[];
}

export interface PostWithDetails extends Post {
  user?: User;
  activity?: Activity;
  likes?: PostLike[];
  comments?: (PostComment & { user?: User })[];
}

export interface ChatWithDetails extends Chat {
  participants?: (ChatParticipant & { user?: User })[];
  messages?: (Message & { sender?: User })[];
}

export interface MessageWithSender extends Message {
  sender?: User;
}

export interface NotificationWithUser extends Notification {
  user?: User;
}
