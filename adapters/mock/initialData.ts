import { DEFAULT_AVATAR_URL, DEFAULT_COVER_URL } from '@/lib/constants';
import type { Activity, User } from '@/types';
import { ActivityStatus, Visibility } from '@/types';

type SeedUser = {
  email: string;
  password: string;
  id: string;
  name: string;
};

export const SEED_USERS: SeedUser[] = [
  {
    email: 'test@example.com',
    password: 'password123456',
    id: 'test-user-id',
    name: 'Test User',
  },
];

// Typed profiles to satisfy the User shape used across the app/adapters
export const SEED_PROFILES: User[] = SEED_USERS.map((user) => ({
  id: user.id,
  email: user.email,
  username: user.email.split('@')[0],
  name: user.name,
  displayName: user.name,
  bio: 'I am a seeded test user.',
  followerCount: 120,
  followingCount: 45,
  interests: ['coding', 'running', 'gaming'],
  createdAt: new Date(),
  updatedAt: new Date(),
  avatarUrl: DEFAULT_AVATAR_URL,
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
    activityType: 'Yoga',
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
