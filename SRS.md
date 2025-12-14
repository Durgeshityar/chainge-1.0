# Chainge — Software Requirements Specification

## System Design

### Overview

- **Client**: React Native mobile app (Expo managed workflow)
- **Backend**: Supabase (Auth + PostgreSQL + Storage + Edge Functions) — abstracted for AWS migration
- **ORM**: Prisma for type-safe database access
- **Real-time**: Supabase Realtime for messaging and activity updates
- **Location**: Expo Location + PostGIS + Geohashing for nearby queries
- **Push Notifications**: Expo Notifications + Supabase Edge Functions

### Architecture Principle

**Backend-Agnostic Design**: All backend interactions go through an abstraction layer (adapters), enabling seamless migration from Supabase to AWS (Cognito, RDS, S3, AppSync, Lambda). Prisma serves as the ORM layer, working with any PostgreSQL database.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Mobile App                        │
│              (React Native + Expo)                   │
├─────────────────────────────────────────────────────┤
│  UI Layer (Screens + Components)                    │
│  State Management (Zustand)                         │
│  Services Layer (uses Adapter interfaces)           │
├─────────────────────────────────────────────────────┤
│  Adapter Layer (Backend Abstraction)                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ IAuthAdapter│  │IDBAdapter   │  │IStorageAdapt│ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────┘
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
┌─────────────────────┐    ┌─────────────────────────┐
│      Supabase       │    │     AWS (Future)        │
├─────┬─────┬────┬────┤    ├─────┬─────┬─────┬──────┤
│Auth │ PG  │Edge│ S3 │    │Cogni│ RDS │Lambd│  S3  │
│     │     │ Fn │    │    │ to  │(PG) │  a  │      │
└─────┴──┬──┴────┴────┘    └─────┴──┬──┴─────┴──────┘
         │                          │
         └──────────┬───────────────┘
                    ▼
            ┌──────────────┐
            │    Prisma    │
            │  (ORM Layer) │
            └──────────────┘
```

### Backend Service Mapping

| Feature              | Supabase              | AWS Equivalent                   |
| -------------------- | --------------------- | -------------------------------- |
| Authentication       | Supabase Auth         | AWS Cognito                      |
| Database             | PostgreSQL + Prisma   | RDS PostgreSQL + Prisma          |
| Real-time            | Supabase Realtime     | AppSync / API Gateway WebSockets |
| File Storage         | Supabase Storage      | S3 + CloudFront                  |
| Serverless Functions | Edge Functions        | Lambda + API Gateway             |
| Push Notifications   | Edge Functions + Expo | SNS + Lambda                     |

---

## Architecture Pattern

### Pattern: Feature-Based Modular Architecture with Adapter Layer

- Organize code by feature/domain (profile, nearby, feed, messaging, home)
- Each feature contains its own screens, components, hooks, and services
- Shared utilities and components in common folders
- **All backend calls go through adapter interfaces**
- **Prisma handles all database operations with type safety**

### Principles

- **Separation of Concerns**: UI, state, and data fetching in separate layers
- **Colocation**: Keep related files together by feature
- **Single Responsibility**: Each component/hook does one thing well
- **Dependency Inversion**: Services depend on adapter interfaces, not implementations
- **Type Safety**: Prisma-generated types flow through the entire application

---

## State Management

### Tool: Zustand

- Lightweight, TypeScript-friendly, minimal boilerplate
- Perfect for beginners coming from React useState

### Store Structure

```
stores/
├── authStore.ts         # User session, profile
├── activityStore.ts     # Current/scheduled activities
├── nearbyStore.ts       # Nearby activities cache
├── feedStore.ts         # Posts, pagination
├── chatStore.ts         # Conversations, messages
└── notificationStore.ts # Notifications, badges
```

### State Categories

| Category     | Tool                      | Reason                    |
| ------------ | ------------------------- | ------------------------- |
| Server State | TanStack Query + Adapters | Caching, refetching, sync |
| UI State     | Zustand                   | Modals, sheets, filters   |
| Auth State   | Zustand + Auth Adapter    | Session persistence       |
| Form State   | React Hook Form           | Validation, submission    |
| Real-time    | Realtime Adapter          | Live updates              |

---

## Data Flow

### Read Flow (Fetching Data)

```
Screen → useQuery Hook → Service → Adapter → Prisma → PostgreSQL
                ↓
         Zustand Store (cache)
                ↓
         Component (render)
```

### Write Flow (Mutations)

```
User Action → Form/Handler → useMutation → Service → Adapter → Prisma → PostgreSQL
                                   ↓
                          Invalidate Query Cache
                                   ↓
                          UI Auto-updates
```

### Real-time Flow (Messaging/Nearby)

```
Realtime Adapter (subscription) → Callback Handler → Zustand Store → UI
```

---

## Technical Stack

### Frontend

| Layer        | Technology                        |
| ------------ | --------------------------------- |
| Framework    | React Native 0.74+                |
| Tooling      | Expo SDK 51+ (managed)            |
| Language     | TypeScript                        |
| Routing      | Expo Router v3 (file-based)       |
| Styling      | React Native StyleSheet (default) |
| State        | Zustand                           |
| Server State | TanStack Query (React Query)      |
| Forms        | React Hook Form + Zod             |
| Animations   | React Native Reanimated           |
| Gestures     | React Native Gesture Handler      |
| Maps         | React Native Maps                 |
| Icons        | Lucide React Native               |

### Backend (Supabase — Primary)

| Service        | Use Case                                           |
| -------------- | -------------------------------------------------- |
| Auth           | Email/password, OAuth (Google, Apple)              |
| PostgreSQL     | Relational database with RLS                       |
| Prisma         | Type-safe ORM for database operations              |
| PostGIS        | Geospatial queries for Nearby                      |
| Realtime       | Subscriptions for live messaging, activity updates |
| Storage        | Profile photos, post images, route maps            |
| Edge Functions | Push notifications, complex operations, AI calls   |

### Backend (AWS — Migration Target)

| Service        | Use Case                                   |
| -------------- | ------------------------------------------ |
| Cognito        | Authentication + social providers          |
| RDS PostgreSQL | Relational database (Prisma compatible)    |
| Prisma         | Same ORM, just different connection string |
| AppSync        | GraphQL API with real-time subscriptions   |
| S3             | File storage                               |
| CloudFront     | CDN for media                              |
| Lambda         | Serverless functions                       |
| SNS            | Push notifications                         |
| API Gateway    | REST/WebSocket APIs                        |

### Development Tools

- ESLint + Prettier (code quality)
- Expo Dev Client (development)
- Expo EAS (builds and submissions)
- Prisma Studio (database GUI)

---

## Prisma Configuration

### Schema Location

```
prisma/
├── schema.prisma    # Main schema file
├── migrations/      # Migration history
└── seed.ts          # Database seeding script
```

### Prisma Client Setup

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Connection Pooling (Serverless)

```typescript
// For Edge Functions / Serverless
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaNeon(pool)
export const prisma = new PrismaClient({ adapter })
```

---

## Adapter Layer Design

### Abstract Interfaces

```typescript
// adapters/types.ts
import type { User, Activity, Post, Chat, Message } from '@prisma/client'

interface IAuthAdapter {
  signUpWithEmail(email: string, password: string): Promise<AuthResult>
  signInWithEmail(email: string, password: string): Promise<AuthResult>
  signInWithGoogle(): Promise<AuthResult>
  signInWithApple(): Promise<AuthResult>
  signOut(): Promise<void>
  resetPassword(email: string): Promise<void>
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void
  getCurrentUser(): AuthUser | null
  getSession(): Session | null
}

interface IDatabaseAdapter {
  // Generic CRUD using Prisma types
  get<T>(model: string, id: string): Promise<T | null>
  list<T>(model: string, query?: QueryOptions): Promise<T[]>
  create<T>(model: string, data: Partial<T>): Promise<T>
  update<T>(model: string, id: string, data: Partial<T>): Promise<T>
  delete(model: string, id: string): Promise<void>

  // Queries
  query<T>(model: string, filters: Filter[]): Promise<T[]>
  queryNearby<T>(
    model: string,
    lat: number,
    lng: number,
    radiusKm: number
  ): Promise<T[]>

  // Pagination
  paginate<T>(
    model: string,
    options: PaginationOptions
  ): Promise<PaginatedResult<T>>

  // Raw Prisma access for complex queries
  raw<T>(operation: (prisma: PrismaClient) => Promise<T>): Promise<T>
}

interface IStorageAdapter {
  upload(bucket: string, path: string, file: Blob | File): Promise<string>
  download(bucket: string, path: string): Promise<Blob>
  delete(bucket: string, path: string): Promise<void>
  getPublicUrl(bucket: string, path: string): string
}

interface IRealtimeAdapter {
  subscribe<T>(
    channel: string,
    event: string,
    callback: (data: T) => void
  ): () => void
  subscribeToTable<T>(
    table: string,
    filter: string,
    callback: (data: T) => void
  ): () => void
  broadcast(channel: string, event: string, data: any): Promise<void>
  presence(channel: string): PresenceChannel
}
```

### Adapter Implementations

```
adapters/
├── types.ts              # Interface definitions (uses Prisma types)
├── AdapterContext.tsx    # React context provider
├── mock/                 # Mock adapters for development
│   ├── authAdapter.ts
│   ├── databaseAdapter.ts
│   ├── storageAdapter.ts
│   └── realtimeAdapter.ts
├── supabase/             # Supabase implementations
│   ├── client.ts         # Supabase client init
│   ├── authAdapter.ts
│   ├── databaseAdapter.ts  # Uses Prisma for DB operations
│   ├── storageAdapter.ts
│   └── realtimeAdapter.ts
└── aws/                  # AWS implementations (future)
    ├── authAdapter.ts      # Cognito
    ├── databaseAdapter.ts  # Uses same Prisma, different connection
    ├── storageAdapter.ts   # S3
    └── realtimeAdapter.ts  # AppSync
```

---

## Authentication Process

### Supported Methods

- Email + Password
- Google OAuth
- Apple Sign-In (required for iOS)

### Auth Flow

```
1. User opens app
2. Check auth state via adapter (authStore)
   ├── User exists → Home screen
   └── No user → Auth screens
3. User signs up/in via adapter
4. Adapter returns user credential
5. Store user in authStore
6. Create/update profile via Prisma (database adapter)
7. Navigate to Home
```

### Session Management

- Auth adapter handles token refresh automatically
- Store user profile in Zustand for quick access
- Listen to auth state changes via adapter's `onAuthStateChange`

### Protected Routes

- Expo Router groups: `(auth)` for public, `(tabs)` for protected
- Redirect logic in root layout based on auth state

---

## Route Design

### Expo Router File Structure

```
app/
├── _layout.tsx              # Root layout (auth check)
├── index.tsx                # Entry redirect
├── (auth)/
│   ├── _layout.tsx          # Auth stack layout
│   ├── welcome.tsx          # Onboarding
│   ├── login.tsx            # Login screen
│   ├── signup.tsx           # Signup screen
│   └── forgot-password.tsx  # Password reset
├── (tabs)/
│   ├── _layout.tsx          # Tab bar layout
│   ├── index.tsx            # Home tab
│   ├── nearby.tsx           # Nearby tab
│   ├── feed.tsx             # Feed tab
│   ├── messages.tsx         # Messages tab
│   └── profile.tsx          # Profile tab
├── activity/
│   ├── [id].tsx             # Activity detail
│   └── tracking.tsx         # Live tracking screen
├── post/
│   └── [id].tsx             # Post detail
├── chat/
│   ├── [id].tsx             # Chat thread
│   └── new.tsx              # New chat/group
├── user/
│   └── [id].tsx             # Other user's profile
├── settings/
│   ├── index.tsx            # Settings menu
│   ├── account.tsx          # Account settings
│   ├── notifications.tsx    # Notification prefs
│   └── privacy.tsx          # Privacy settings
└── notifications.tsx        # Notifications screen
```

### Navigation Patterns

| Action               | Navigation                |
| -------------------- | ------------------------- |
| Tab switch           | Bottom tab bar            |
| View activity detail | Push to `/activity/[id]`  |
| Open chat            | Push to `/chat/[id]`      |
| View profile         | Push to `/user/[id]`      |
| Start activity       | Open bottom sheet (modal) |
| Settings             | Push to `/settings`       |

---

## API Design

### Service Layer (Uses Adapters + Prisma)

Services provide domain-specific operations using the abstract adapter interfaces with Prisma-generated types:

```typescript
// services/users.ts
import type { User, Follow } from '@prisma/client'

class UserService {
  constructor(private db: IDatabaseAdapter, private storage: IStorageAdapter) {}

  async getUserById(userId: string): Promise<User | null> {
    return this.db.get<User>('user', userId)
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    return this.db.update<User>('user', userId, data)
  }

  async uploadAvatar(userId: string, file: Blob): Promise<string> {
    const path = `avatars/${userId}.jpg`
    return this.storage.upload('avatars', path, file)
  }

  async followUser(followerId: string, followingId: string): Promise<Follow> {
    return this.db.create<Follow>('follow', {
      followerId,
      followingId,
    })
  }

  async getFollowers(userId: string): Promise<User[]> {
    return this.db.raw(async (prisma) => {
      const follows = await prisma.follow.findMany({
        where: { followingId: userId },
        include: { follower: true },
      })
      return follows.map((f) => f.follower)
    })
  }
}
```

```typescript
// services/activities.ts
import type { Activity, ActivityParticipant } from '@prisma/client'

class ActivityService {
  constructor(private db: IDatabaseAdapter) {}

  async getNearbyActivities(
    lat: number,
    lng: number,
    radiusKm: number
  ): Promise<Activity[]> {
    return this.db.queryNearby<Activity>('activity', lat, lng, radiusKm)
  }

  async createActivity(
    data: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Activity> {
    return this.db.create<Activity>('activity', {
      ...data,
      status: 'SCHEDULED',
    })
  }

  async joinActivity(
    activityId: string,
    userId: string
  ): Promise<ActivityParticipant> {
    return this.db.create<ActivityParticipant>('activityParticipant', {
      activityId,
      userId,
      status: 'PENDING',
    })
  }

  async getActivityWithParticipants(activityId: string) {
    return this.db.raw(async (prisma) => {
      return prisma.activity.findUnique({
        where: { id: activityId },
        include: {
          user: true,
          participants: {
            include: { user: true },
          },
        },
      })
    })
  }
}
```

```typescript
// services/chats.ts (with real-time)
import type { Chat, Message } from '@prisma/client'

class ChatService {
  constructor(
    private db: IDatabaseAdapter,
    private realtime: IRealtimeAdapter
  ) {}

  async sendMessage(
    chatId: string,
    senderId: string,
    content: string
  ): Promise<Message> {
    const message = await this.db.create<Message>('message', {
      chatId,
      senderId,
      content,
    })

    // Update chat's last message
    await this.db.update('chat', chatId, {
      lastMessageId: message.id,
      updatedAt: new Date(),
    })

    return message
  }

  subscribeToMessages(
    chatId: string,
    callback: (msg: Message) => void
  ): () => void {
    return this.realtime.subscribeToTable<Message>(
      'Message',
      `chatId=eq.${chatId}`,
      callback
    )
  }

  async getChatWithMessages(chatId: string) {
    return this.db.raw(async (prisma) => {
      return prisma.chat.findUnique({
        where: { id: chatId },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: { sender: true },
          },
          participants: {
            include: { user: true },
          },
        },
      })
    })
  }
}
```

### Edge Functions / Serverless (Complex Operations)

| Function               | Trigger          | Purpose                              |
| ---------------------- | ---------------- | ------------------------------------ |
| `on-user-signup`       | Auth event       | Create user profile via Prisma       |
| `send-push`            | Database trigger | Trigger push via Expo                |
| `process-activity-end` | Database update  | Generate post draft, calculate stats |
| `generate-wingman`     | HTTP call        | AI-generated intro text              |
| `cleanup-activities`   | Scheduled (cron) | Remove expired activities via Prisma |

---

## Database Design (Prisma Schema)

### Prisma Schema File

```prisma
// prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  directUrl  = env("DIRECT_URL")
  extensions = [postgis]
}

// ==================== ENUMS ====================

enum ActivityStatus {
  SCHEDULED
  ACTIVE
  COMPLETED
  CANCELLED
}

enum Visibility {
  PUBLIC
  FOLLOWERS
  PRIVATE
}

enum ParticipantStatus {
  PENDING
  APPROVED
  DECLINED
}

enum ChatType {
  DIRECT
  GROUP
}

enum NotificationType {
  JOIN_REQUEST
  JOIN_APPROVED
  JOIN_DECLINED
  LIKE
  COMMENT
  FOLLOW
  MESSAGE
}

// ==================== MODELS ====================

model User {
  id             String   @id @default(uuid())
  email          String   @unique
  username       String   @unique
  displayName    String?
  bio            String?
  avatarUrl      String?
  interests      String[]
  latitude       Float?
  longitude      Float?
  followerCount  Int      @default(0)
  followingCount Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Relations
  activities           Activity[]
  activityParticipants ActivityParticipant[]
  posts                Post[]
  postLikes            PostLike[]
  postComments         PostComment[]
  sentMessages         Message[]
  chatParticipants     ChatParticipant[]
  notifications        Notification[]
  followers            Follow[]             @relation("following")
  following            Follow[]             @relation("follower")

  @@index([username])
  @@index([email])
  @@map("users")
}

model Follow {
  id          String   @id @default(uuid())
  followerId  String
  followingId String
  createdAt   DateTime @default(now())

  follower  User @relation("follower", fields: [followerId], references: [id], onDelete: Cascade)
  following User @relation("following", fields: [followingId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
  @@map("follows")
}

model Activity {
  id           String                      @id @default(uuid())
  userId       String
  activityType String
  status       ActivityStatus              @default(SCHEDULED)
  scheduledAt  DateTime?
  startedAt    DateTime?
  endedAt      DateTime?
  latitude     Float?
  longitude    Float?
  locationName String?
  routeData    Json?
  stats        Json?
  visibility   Visibility                  @default(PUBLIC)
  createdAt    DateTime                    @default(now())
  updatedAt    DateTime                    @updatedAt

  // Relations
  user         User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  participants ActivityParticipant[]
  posts        Post[]

  @@index([userId])
  @@index([status])
  @@index([scheduledAt])
  @@index([latitude, longitude])
  @@map("activities")
}

model ActivityParticipant {
  id         String            @id @default(uuid())
  activityId String
  userId     String
  status     ParticipantStatus @default(PENDING)
  createdAt  DateTime          @default(now())

  activity Activity @relation(fields: [activityId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([activityId, userId])
  @@index([activityId])
  @@index([userId])
  @@map("activity_participants")
}

model Post {
  id             String   @id @default(uuid())
  userId         String
  activityId     String?
  caption        String?
  mediaUrls      String[]
  mapSnapshotUrl String?
  stats          Json?
  likeCount      Int      @default(0)
  commentCount   Int      @default(0)
  createdAt      DateTime @default(now())

  // Relations
  user     User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  activity Activity?     @relation(fields: [activityId], references: [id], onDelete: SetNull)
  likes    PostLike[]
  comments PostComment[]

  @@index([userId])
  @@index([createdAt(sort: Desc)])
  @@map("posts")
}

model PostLike {
  id        String   @id @default(uuid())
  postId    String
  userId    String
  createdAt DateTime @default(now())

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([postId, userId])
  @@index([postId])
  @@map("post_likes")
}

model PostComment {
  id        String   @id @default(uuid())
  postId    String
  userId    String
  content   String
  createdAt DateTime @default(now())

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@map("post_comments")
}

model Chat {
  id            String   @id @default(uuid())
  type          ChatType @default(DIRECT)
  name          String?
  lastMessageId String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  participants ChatParticipant[]
  messages     Message[]

  @@map("chats")
}

model ChatParticipant {
  id         String    @id @default(uuid())
  chatId     String
  userId     String
  joinedAt   DateTime  @default(now())
  lastReadAt DateTime?

  chat Chat @relation(fields: [chatId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([chatId, userId])
  @@index([chatId])
  @@index([userId])
  @@map("chat_participants")
}

model Message {
  id        String   @id @default(uuid())
  chatId    String
  senderId  String
  content   String
  createdAt DateTime @default(now())

  chat   Chat @relation(fields: [chatId], references: [id], onDelete: Cascade)
  sender User @relation(fields: [senderId], references: [id], onDelete: Cascade)

  @@index([chatId, createdAt(sort: Desc)])
  @@map("messages")
}

model Notification {
  id        String           @id @default(uuid())
  userId    String
  type      NotificationType
  title     String
  body      String?
  data      Json?
  read      Boolean          @default(false)
  createdAt DateTime         @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt(sort: Desc)])
  @@map("notifications")
}
```

### Database Functions (Raw SQL via Prisma)

```typescript
// lib/db/nearbyActivities.ts
import { prisma } from '@/lib/prisma'
import type { Activity } from '@prisma/client'

export async function getNearbyActivities(
  lat: number,
  lng: number,
  radiusKm: number = 10
): Promise<Activity[]> {
  // Using PostGIS ST_DWithin for accurate distance calculation
  return prisma.$queryRaw<Activity[]>`
    SELECT *
    FROM activities
    WHERE status = 'SCHEDULED'
      AND visibility = 'PUBLIC'
      AND ST_DWithin(
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        ${radiusKm * 1000}
      )
    ORDER BY scheduled_at ASC
  `
}
```

### Database Triggers (SQL Migrations)

```sql
-- prisma/migrations/triggers.sql

-- Auto-update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER chats_updated_at
  BEFORE UPDATE ON chats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update follower/following counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
    UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users SET follower_count = follower_count - 1 WHERE id = OLD.following_id;
    UPDATE users SET following_count = following_count - 1 WHERE id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER follow_counts_trigger
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- Update post like/comment counts
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_like_count_trigger
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_comment_count_trigger
  AFTER INSERT OR DELETE ON post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();
```

### Entity Relationships Diagram

```
User ─────────────────────────────────────────────────┐
  │                                                   │
  ├──< Follow (follower/following)                    │
  │                                                   │
  ├──< Activity                                       │
  │       └──< ActivityParticipant                    │
  │                                                   │
  ├──< Post                                           │
  │       ├──< PostLike                               │
  │       └──< PostComment                            │
  │                                                   │
  ├──< ChatParticipant ──> Chat                       │
  │                          └──< Message ◄───────────┘
  │
  └──< Notification
```

---

## Folder Structure

```
chainge/
├── app/                          # Expo Router screens
│   ├── (auth)/                   # Auth screens
│   ├── (tabs)/                   # Main tab screens
│   ├── activity/                 # Activity screens
│   ├── chat/                     # Chat screens
│   ├── post/                     # Post screens
│   ├── user/                     # User profile screens
│   ├── settings/                 # Settings screens
│   ├── _layout.tsx               # Root layout
│   └── index.tsx                 # Entry point
│
├── prisma/                       # Prisma configuration
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # Migration files
│   └── seed.ts                   # Seeding script
│
├── adapters/                     # Backend abstraction layer
│   ├── types.ts                  # Interface definitions (uses Prisma types)
│   ├── AdapterContext.tsx        # React context provider
│   ├── mock/                     # Mock implementations
│   │   ├── authAdapter.ts
│   │   ├── databaseAdapter.ts
│   │   ├── storageAdapter.ts
│   │   └── realtimeAdapter.ts
│   ├── supabase/                 # Supabase implementations
│   │   ├── client.ts             # Supabase client init
│   │   ├── authAdapter.ts
│   │   ├── databaseAdapter.ts    # Uses Prisma
│   │   ├── storageAdapter.ts
│   │   └── realtimeAdapter.ts
│   └── aws/                      # AWS implementations (future)
│       ├── authAdapter.ts        # Cognito
│       ├── databaseAdapter.ts    # Uses same Prisma
│       ├── storageAdapter.ts     # S3
│       └── realtimeAdapter.ts    # AppSync
│
├── components/                   # Shared components
│   ├── ui/                       # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Avatar.tsx
│   │   ├── IconButton.tsx
│   │   ├── BottomSheet.tsx
│   │   └── ...
│   ├── layout/                   # Layout components
│   │   ├── SafeArea.tsx
│   │   ├── TabBar.tsx
│   │   └── Header.tsx
│   ├── feed/                     # Feed-specific
│   │   ├── PostCard.tsx
│   │   ├── CommentSheet.tsx
│   │   └── ShareSheet.tsx
│   ├── nearby/                   # Nearby-specific
│   │   ├── ActivityCard.tsx
│   │   ├── SwipeStack.tsx
│   │   └── FilterSheet.tsx
│   ├── activity/                 # Activity-specific
│   │   ├── ActivityPicker.tsx
│   │   ├── TrackingMap.tsx
│   │   └── StatsDisplay.tsx
│   ├── messaging/                # Chat-specific
│   │   ├── ChatListItem.tsx
│   │   ├── MessageBubble.tsx
│   │   └── ChatInput.tsx
│   └── profile/                  # Profile-specific
│       ├── ProfileHeader.tsx
│       ├── WingmanCard.tsx
│       └── PostGrid.tsx
│
├── hooks/                        # Custom hooks
│   ├── useAuth.ts
│   ├── useAdapter.ts             # Access adapters from context
│   ├── useLocation.ts
│   ├── useActivity.ts
│   ├── useChat.ts
│   └── useNotifications.ts
│
├── stores/                       # Zustand stores
│   ├── authStore.ts
│   ├── activityStore.ts
│   ├── chatStore.ts
│   └── uiStore.ts
│
├── services/                     # Domain services (use adapters)
│   ├── auth.ts
│   ├── users.ts
│   ├── activities.ts
│   ├── posts.ts
│   ├── chats.ts
│   ├── storage.ts
│   └── notifications.ts
│
├── lib/                          # Utilities
│   ├── prisma.ts                 # Prisma client instance
│   ├── utils.ts                  # Helper functions
│   ├── constants.ts              # App constants
│   ├── validators.ts             # Zod schemas
│   ├── geohash.ts                # Geohash utilities
│   └── queryClient.ts            # React Query setup
│
├── types/                        # TypeScript types
│   ├── index.ts                  # Re-export Prisma types + custom types
│   └── navigation.ts             # Route params
│
├── theme/                        # Design tokens
│   ├── colors.ts
│   ├── typography.ts
│   └── spacing.ts
│
├── assets/                       # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── app.json                      # Expo config
├── tsconfig.json                 # TypeScript config
├── package.json
└── .env                          # Environment variables (DATABASE_URL, etc.)
```

---

## Reusable Components List

### UI Primitives (components/ui/)

| Component     | Description                     | Props                                      |
| ------------- | ------------------------------- | ------------------------------------------ |
| `Button`      | Primary/secondary/icon variants | variant, size, loading, disabled, onPress  |
| `Input`       | Text input with label, error    | label, error, placeholder, secureTextEntry |
| `Card`        | Container with dark bg, border  | children, onPress, style                   |
| `Avatar`      | User image with fallback        | uri, size, online, fallback                |
| `IconButton`  | Circular icon tap target        | icon, size, variant, onPress               |
| `BottomSheet` | Draggable sheet modal           | visible, height, onClose, children         |
| `Badge`       | Notification count              | count, variant                             |
| `Chip`        | Tag/filter pill                 | label, selected, onPress                   |
| `Divider`     | Horizontal line                 | inset                                      |
| `Skeleton`    | Loading placeholder             | width, height, circle                      |
| `Toast`       | Auto-dismiss message            | message, type                              |

### Layout (components/layout/)

| Component         | Description                     |
| ----------------- | ------------------------------- |
| `SafeArea`        | Handles notch/safe areas        |
| `TabBar`          | Custom bottom tab bar           |
| `Header`          | Screen header with back/actions |
| `ScreenContainer` | Standard screen wrapper         |

### Feature Components

| Component          | Feature       | Description                    |
| ------------------ | ------------- | ------------------------------ |
| `PostCard`         | Feed          | Full-screen post display       |
| `ActivityCard`     | Nearby        | Swipeable activity card        |
| `SwipeStack`       | Nearby        | Card stack with gestures       |
| `ChatListItem`     | Messages      | Conversation preview row       |
| `MessageBubble`    | Messages      | Single message display         |
| `ProfileHeader`    | Profile       | Avatar, stats, follow button   |
| `WingmanCard`      | Profile       | AI intro display               |
| `ActivityPicker`   | Home          | Grid of activity types         |
| `TrackingMap`      | Home          | Live GPS map view              |
| `StatsDisplay`     | Home          | Metrics (time, distance, pace) |
| `CommentSheet`     | Feed          | Comments bottom sheet          |
| `ShareSheet`       | Feed          | Share options sheet            |
| `FilterSheet`      | Nearby        | Activity/distance filters      |
| `NotificationItem` | Notifications | Single notification row        |

---

## Migration Guide: Supabase to AWS

### Step-by-Step Migration

1. **Set Up AWS RDS PostgreSQL**

   - Create RDS PostgreSQL instance
   - Configure security groups and VPC
   - Note the connection string

2. **Update Prisma Configuration**

   ```env
   # .env (AWS)
   DATABASE_URL="postgresql://user:password@your-rds-instance.amazonaws.com:5432/chainge"
   ```

3. **Run Prisma Migrations on AWS RDS**

   ```bash
   npx prisma migrate deploy
   ```

4. **Implement AWS Adapters**

   - Create `adapters/aws/authAdapter.ts` using AWS Cognito SDK
   - Create `adapters/aws/databaseAdapter.ts` (uses same Prisma client!)
   - Create `adapters/aws/storageAdapter.ts` using S3 SDK
   - Create `adapters/aws/realtimeAdapter.ts` using AppSync or API Gateway WebSockets

5. **Update Environment Configuration**

   - Add AWS credentials and region to environment variables
   - Update adapter context to use AWS adapters based on env flag

6. **Data Migration**

   - Use `pg_dump` to export from Supabase PostgreSQL
   - Use `pg_restore` to import into AWS RDS
   - Or use AWS DMS for live migration

7. **Switch Adapter Provider**

   ```typescript
   // adapters/AdapterContext.tsx
   const adapters =
     process.env.BACKEND === 'aws'
       ? createAWSAdapters()
       : createSupabaseAdapters()
   ```

8. **No Frontend Changes Required**
   - All screens, components, and services remain unchanged
   - Prisma types remain the same
   - Only adapter implementations differ

### Why Prisma Makes Migration Easy

| Aspect     | Benefit                                         |
| ---------- | ----------------------------------------------- |
| Schema     | Same `schema.prisma` works with any PostgreSQL  |
| Types      | Generated types are database-agnostic           |
| Queries    | Prisma Client works identically                 |
| Migrations | `prisma migrate deploy` works on any PostgreSQL |
| Connection | Just change `DATABASE_URL`                      |

### AWS Service Configuration

| AWS Service    | Configuration Needed                        |
| -------------- | ------------------------------------------- |
| Cognito        | User Pool, Identity Pool, App Client        |
| RDS PostgreSQL | Instance, security groups, parameter groups |
| S3             | Buckets with CORS, lifecycle policies       |
| AppSync        | GraphQL schema, resolvers, subscriptions    |
| Lambda         | Functions, IAM roles, VPC config            |
| API Gateway    | REST/WebSocket APIs, authorizers            |
| CloudFront     | Distribution for S3 media                   |
| SNS            | Topics for push notifications               |
