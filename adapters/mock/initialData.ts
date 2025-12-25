import { DEFAULT_AVATAR_URL, DEFAULT_COVER_URL } from '@/lib/constants';
import type {
    Activity,
    Chat,
    ChatParticipant,
    Message,
    Post,
    PostComment,
    PostLike,
    User,
} from '@/types';
import { ActivityStatus, ChatType, NotificationType, Visibility } from '@/types';

type SeedUser = {
  email: string;
  password: string;
  id: string;
  name: string;
  username?: string;
  avatarUrl?: string;
  bio?: string;
};

export const SEED_USERS: SeedUser[] = [
  {
    email: 'test@example.com',
    password: 'password123456',
    id: 'test-user-id',
    name: 'Test User',
    username: 'testuser',
    avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200',
  },
  {
    email: 'ava@example.com',
    password: 'password123456',
    id: 'ava-user-id',
    name: 'Ava Green',
    username: 'ava',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  },
  {
    email: 'lena@example.com',
    password: 'password123456',
    id: 'lena-user-id',
    name: 'Lena Rose',
    username: 'lena',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200',
  },
  {
    email: 'liam@example.com',
    password: 'password123456',
    id: 'liam-user-id',
    name: 'Liam Rider',
    username: 'liam',
    avatarUrl: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200',
  },
  {
    email: 'zoe@example.com',
    password: 'password123456',
    id: 'zoe-user-id',
    name: 'Zoe Pace',
    username: 'zoe',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200',
  },
  {
    email: 'riya@example.com',
    password: 'password123',
    id: 'riya-user-id',
    name: 'Riya',
    username: 'riya_c',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
  },
  {
    email: 'aarav@example.com',
    password: 'password123',
    id: 'aarav-user-id',
    name: 'Aarav',
    username: 'aarav_m',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200', // Male avatar
  },
  {
    email: 'neha@example.com',
    password: 'password123',
    id: 'neha-user-id',
    name: 'Neha',
    username: 'neha_s',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
  },
];

// Typed profiles to satisfy the User shape used across the app/adapters
export const SEED_PROFILES: User[] = SEED_USERS.map((user) => ({
  id: user.id,
  email: user.email,
  username: user.username ?? user.email.split('@')[0],
  name: user.name,
  displayName: user.name,
  bio: user.bio ?? 'I am a seeded test user.',
  followerCount: 120,
  followingCount: 45,
  interests: ['Football', 'Running', 'Cycling'],
  createdAt: new Date(),
  updatedAt: new Date(),
  avatarUrl: user.avatarUrl ?? DEFAULT_AVATAR_URL,
  coverImage: DEFAULT_COVER_URL,
  latitude: 40.7128,
  longitude: -74.006,
  age: 28,
  gender: 'Male',
  height: '6\'1"',
  location: 'New York, USA',
  // Optional fields not used in mocks yet
  weight: undefined,
  activityTracker: undefined,
}));

// Nearby-friendly seed activities for UI testing
export const SEED_ACTIVITIES: Activity[] = [
  {
    id: 'activity-mumbai-run',
    userId: SEED_USERS[0].id,
    activityType: 'Run',
    status: ActivityStatus.SCHEDULED,
    scheduledAt: new Date(Date.now() + 45 * 60 * 1000),
    startedAt: null,
    endedAt: null,
    latitude: 19.076,
    longitude: 72.8777,
    locationName: 'Marine Drive, Mumbai',
    routeData: null,
    stats: null,
    visibility: Visibility.PUBLIC,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'activity-bandra-cycle',
    userId: SEED_USERS[0].id,
    activityType: 'Cycling',
    status: ActivityStatus.SCHEDULED,
    scheduledAt: new Date(Date.now() + 90 * 60 * 1000),
    startedAt: null,
    endedAt: null,
    latitude: 19.0602,
    longitude: 72.8366,
    locationName: 'Bandra Bandstand',
    routeData: null,
    stats: null,
    visibility: Visibility.PUBLIC,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'activity-juhu-yoga',
    userId: SEED_USERS[0].id,
    activityType: 'Cricket',
    status: ActivityStatus.SCHEDULED,
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    startedAt: null,
    endedAt: null,
    latitude: 19.0988,
    longitude: 72.8267,
    locationName: 'Juhu Beach',
    routeData: null,
    stats: null,
    visibility: Visibility.PUBLIC,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Messaging seed data to preview matched, DM, and group states
export const SEED_CHATS: Chat[] = [
  {
    id: 'chat-matched-duo',
    type: ChatType.DIRECT,
    name: null,
    lastMessageId: 'msg-matched-2',
    isMatched: true,
    createdAt: new Date(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
  },
  {
    id: 'chat-dm-single',
    type: ChatType.DIRECT,
    name: null,
    lastMessageId: 'msg-dm-1',
    createdAt: new Date(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
  },
  {
    id: 'chat-group-weekend',
    type: ChatType.GROUP,
    name: 'Weekend Riders',
    lastMessageId: 'msg-group-2',
    createdAt: new Date(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
];

export const SEED_CHAT_PARTICIPANTS: ChatParticipant[] = [
  // Matched chat (user + two others for dual avatar pill)
  {
    id: 'cp-matched-user',
    chatId: 'chat-matched-duo',
    userId: 'test-user-id',
    joinedAt: new Date(),
    lastReadAt: new Date(),
  },
  {
    id: 'cp-matched-ava',
    chatId: 'chat-matched-duo',
    userId: 'ava-user-id',
    joinedAt: new Date(),
    lastReadAt: null,
  },
  {
    id: 'cp-matched-lena',
    chatId: 'chat-matched-duo',
    userId: 'lena-user-id',
    joinedAt: new Date(),
    lastReadAt: null,
  },

  // Single DM (user + Liam)
  {
    id: 'cp-dm-user',
    chatId: 'chat-dm-single',
    userId: 'test-user-id',
    joinedAt: new Date(),
    lastReadAt: new Date(),
  },
  {
    id: 'cp-dm-liam',
    chatId: 'chat-dm-single',
    userId: 'liam-user-id',
    joinedAt: new Date(),
    lastReadAt: null,
  },

  // Group chat (user + Ava + Liam + Zoe)
  {
    id: 'cp-group-user',
    chatId: 'chat-group-weekend',
    userId: 'test-user-id',
    joinedAt: new Date(),
    lastReadAt: new Date(),
  },
  {
    id: 'cp-group-ava',
    chatId: 'chat-group-weekend',
    userId: 'ava-user-id',
    joinedAt: new Date(),
    lastReadAt: null,
  },
  {
    id: 'cp-group-liam',
    chatId: 'chat-group-weekend',
    userId: 'liam-user-id',
    joinedAt: new Date(),
    lastReadAt: null,
  },
  {
    id: 'cp-group-zoe',
    chatId: 'chat-group-weekend',
    userId: 'zoe-user-id',
    joinedAt: new Date(),
    lastReadAt: null,
  },
];

export const SEED_MESSAGES: Message[] = [
  // Matched chat
  {
    id: 'msg-matched-1',
    chatId: 'chat-matched-duo',
    senderId: 'ava-user-id',
    content: 'Incoming texts written here will be seen here',
    createdAt: new Date(),
  },
  {
    id: 'msg-matched-media-1',
    chatId: 'chat-matched-duo',
    senderId: 'ava-user-id',
    content: '',
    mediaUrls: [
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600',
      'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=600',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
    ],
    createdAt: new Date(Date.now() + 1000), // Slightly newer
  },
  {
    id: 'msg-matched-2',
    chatId: 'chat-matched-duo',
    senderId: 'lena-user-id',
    content: 'We matched for Sunday hike!',
    createdAt: new Date(),
  },

  // Single DM
  {
    id: 'msg-dm-1',
    chatId: 'chat-dm-single',
    senderId: 'liam-user-id',
    content: 'Text to be written here, Text to be written here',
    createdAt: new Date(),
  },

  // Group chat
  {
    id: 'msg-group-1',
    chatId: 'chat-group-weekend',
    senderId: 'ava-user-id',
    content: 'Incoming texts written here will be seen here',
    createdAt: new Date(),
  },
  {
    id: 'msg-group-2',
    chatId: 'chat-group-weekend',
    senderId: 'zoe-user-id',
    content: 'Saturday ride starts 7am, helmets on!',
    createdAt: new Date(),
  },
];

// Feed seed data to mirror the Figma reference (hero + compact cards)
export const SEED_POSTS: Post[] = [
  {
    id: 'post-hero-1',
    userId: SEED_USERS[1].id, // Ava Green
    activityId: null,
    caption: 'Easy miles to close that 10k',
    mediaUrls: ['https://images.unsplash.com/photo-1521417532321-0f5dfabd7c81?w=1200'],
    mapSnapshotUrl: null,
    stats: { duration: 600, pace: 360, distance: 2000 },
    likeCount: 12000,
    commentCount: 120,
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    updatedAt: new Date(),
  },
  {
    id: 'post-hero-2',
    userId: SEED_USERS[0].id, // Test User (to ensure feed shows when no follows)
    activityId: null,
    caption: 'Getting ready for Sunday long run',
    mediaUrls: ['https://images.unsplash.com/photo-1521417532321-0f5dfabd7c81?w=1200'],
    mapSnapshotUrl: null,
    stats: { duration: 900, pace: 380, distance: 2500 },
    likeCount: 420,
    commentCount: 8,
    createdAt: new Date(Date.now() - 1000 * 60 * 8),
    updatedAt: new Date(),
  },
  {
    id: 'post-compact-1',
    userId: SEED_USERS[2].id, // Lena
    activityId: null,
    caption: 'Close beat!',
    mediaUrls: [],
    mapSnapshotUrl: null,
    stats: { duration: 600, pace: 410, distance: 1500 },
    likeCount: 12000,
    commentCount: 120,
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
    updatedAt: new Date(),
  },
];

export const SEED_POST_LIKES: PostLike[] = [
  {
    id: 'like-hero-1',
    postId: 'post-hero-1',
    userId: SEED_USERS[0].id,
    createdAt: new Date(),
  },
];

export const SEED_POST_COMMENTS: PostComment[] = [
  {
    id: 'cmt-hero-1',
    postId: 'post-hero-1',
    userId: SEED_USERS[1].id,
    content: 'Awesome, how long have you been training?',
    createdAt: new Date(Date.now() - 1000 * 60 * 2),
  },
  {
    id: 'cmt-hero-2',
    postId: 'post-hero-1',
    userId: SEED_USERS[2].id,
    content: 'Awesome.. great run!',
    createdAt: new Date(Date.now() - 1000 * 60 * 2),
  },
];

export const SEED_NOTIFICATIONS: Notification[] = [
  // 1. New Match (Riya)
  {
    id: 'notif-match-1',
    userId: 'test-user-id',
    type: NotificationType.MATCH,
    title: 'New Match',
    body: 'You and Riya liked each other. Say hi while the spark is fresh.',
    data: {
      matchId: 'riya-user-id',
      chatId: 'chat-new-match',
    },
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
  },
  // 2. Connection Request (Aarav)
  {
    id: 'notif-request-1',
    userId: 'test-user-id',
    type: NotificationType.CONNECTION_REQUEST,
    title: 'Someone Sent a Request',
    body: 'Aarav wants to connect. Accept or pass.',
    data: {
      requesterId: 'aarav-user-id',
    },
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour
  },
  // 3. Like (Latest photo)
  {
    id: 'notif-like-1',
    userId: 'test-user-id',
    type: NotificationType.LIKE,
    title: 'Someone Liked Your Photo',
    body: 'Your latest picture is getting attention.',
    data: {
      postId: 'post-1',
      likerId: 'unknown-id', // Generic or specific
    },
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 120), // 2 hours
  },
  // 4. Message (Aarav)
  {
    id: 'notif-msg-1',
    userId: 'test-user-id',
    type: NotificationType.MESSAGE,
    title: 'Aarav messaged you',
    body: "Don't leave them hanging.",
    data: {
      chatId: 'chat-aarav',
      senderId: 'aarav-user-id',
    },
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 180), // 3 hours
  },
  // 5. Event Reminder (Neha)
  {
    id: 'notif-event-1',
    userId: 'test-user-id',
    type: NotificationType.EVENT_REMINDER,
    title: 'Event Reminder',
    body: 'Your meetup with Neha is today. Keep it simple and be yourself.',
    data: {
      eventId: 'event-1',
      partnerId: 'neha-user-id',
    },
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 300), // 5 hours
  },
];
