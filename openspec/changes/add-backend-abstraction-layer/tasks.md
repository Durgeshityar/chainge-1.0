# Tasks: Backend Abstraction Layer

## 1. Define Common Types

- [x] 1.1 Create `types/index.ts` with User type (id, email, username, displayName, bio, avatarUrl, interests, location, followerCount, followingCount, timestamps)
- [x] 1.2 Add Activity type (id, userId, activityType, status, scheduledAt, startedAt, endedAt, location, routeData, stats, visibility)
- [x] 1.3 Add ActivityParticipant type (id, activityId, userId, status)
- [x] 1.4 Add Post type (id, userId, activityId, caption, mediaUrls, mapSnapshotUrl, stats, likeCount, commentCount)
- [x] 1.5 Add PostLike, PostComment types
- [x] 1.6 Add Chat type (id, type, name, lastMessageId, participants)
- [x] 1.7 Add ChatParticipant, Message types
- [x] 1.8 Add Notification type (id, userId, type, title, body, data, read)
- [x] 1.9 Add Follow type (id, followerId, followingId)
- [x] 1.10 Add enums: ActivityStatus, Visibility, ParticipantStatus, ChatType, NotificationType

## 2. Define Adapter Interfaces

- [x] 2.1 Create `adapters/types.ts` with AuthUser and Session types
- [x] 2.2 Add AuthResult type (user, session, error)
- [x] 2.3 Define IAuthAdapter interface (signUp, signIn, signOut, resetPassword, onAuthStateChange, getCurrentUser, getSession)
- [x] 2.4 Add QueryOptions, Filter, PaginationOptions, PaginatedResult types
- [x] 2.5 Define IDatabaseAdapter interface (get, list, create, update, delete, query, queryNearby, paginate)
- [x] 2.6 Define IStorageAdapter interface (upload, download, delete, getPublicUrl)
- [x] 2.7 Add PresenceChannel type for realtime presence
- [x] 2.8 Define IRealtimeAdapter interface (subscribe, subscribeToTable, broadcast, presence)
- [x] 2.9 Export all types and interfaces

## 3. Implement Mock Auth Adapter

- [x] 3.1 Create `adapters/mock/authAdapter.ts` with MockAuthAdapter class
- [x] 3.2 Implement in-memory user storage (Map<email, MockUser>)
- [x] 3.3 Implement signUpWithEmail (create user, store password hash simulation)
- [x] 3.4 Implement signInWithEmail (validate credentials, return user/session)
- [x] 3.5 Implement signInWithGoogle/signInWithApple (mock OAuth flow)
- [x] 3.6 Implement signOut (clear current user)
- [x] 3.7 Implement resetPassword (mock email sent)
- [x] 3.8 Implement onAuthStateChange with callback subscription pattern
- [x] 3.9 Implement getCurrentUser and getSession getters
- [x] 3.10 Add mock delay configuration for realistic testing

## 4. Implement Mock Database Adapter

- [x] 4.1 Create `adapters/mock/databaseAdapter.ts` with MockDatabaseAdapter class
- [x] 4.2 Implement in-memory storage (Map per model: users, activities, posts, etc.)
- [x] 4.3 Implement get<T> (find by id)
- [x] 4.4 Implement list<T> with query options (where, orderBy, limit)
- [x] 4.5 Implement create<T> (generate uuid, add timestamps, store)
- [x] 4.6 Implement update<T> (merge data, update timestamps)
- [x] 4.7 Implement delete (remove from storage)
- [x] 4.8 Implement query<T> with filter evaluation (eq, gt, lt, contains, etc.)
- [x] 4.9 Implement queryNearby<T> with mock distance calculation
- [x] 4.10 Implement paginate<T> with cursor-based pagination
- [x] 4.11 Add seed data generation utility

## 5. Implement Mock Storage Adapter

- [x] 5.1 Create `adapters/mock/storageAdapter.ts` with MockStorageAdapter class
- [x] 5.2 Implement in-memory file storage (Map<path, base64>)
- [x] 5.3 Implement upload (store file as base64, return mock URL)
- [x] 5.4 Implement download (retrieve base64, convert to Blob)
- [x] 5.5 Implement delete (remove from storage)
- [x] 5.6 Implement getPublicUrl (return mock URL pattern)

## 6. Implement Mock Realtime Adapter

- [x] 6.1 Create `adapters/mock/realtimeAdapter.ts` with MockRealtimeAdapter class
- [x] 6.2 Implement event emitter pattern for subscriptions
- [x] 6.3 Implement subscribe (register callback for channel:event)
- [x] 6.4 Implement subscribeToTable (register callback for model changes)
- [x] 6.5 Implement broadcast (emit to all subscribers)
- [x] 6.6 Implement mock presence channel (join, leave, track users)
- [x] 6.7 Add internal emit method for database adapter to trigger on changes

## 7. Create Adapter Provider

- [x] 7.1 Create `adapters/AdapterContext.tsx` with AdapterContextType
- [x] 7.2 Define Adapters interface (auth, database, storage, realtime)
- [x] 7.3 Create AdapterContext with createContext
- [x] 7.4 Create createMockAdapters factory function
- [x] 7.5 Implement AdapterProvider component with adapters as value
- [x] 7.6 Add environment-based adapter selection (mock vs supabase vs aws)
- [x] 7.7 Export useAdapterContext hook for internal use

## 8. Create Adapter Hooks

- [x] 8.1 Create `hooks/useAdapter.ts` as barrel export
- [x] 8.2 Implement useAuth hook (wraps authAdapter with auth state from store)
- [x] 8.3 Implement useDatabase hook (returns database adapter)
- [x] 8.4 Implement useStorage hook (returns storage adapter)
- [x] 8.5 Implement useRealtime hook (returns realtime adapter)

## 9. Implement Auth Service

- [x] 9.1 Create `services/auth.ts` with AuthService class
- [x] 9.2 Implement signUp (call adapter, create user profile in db)
- [x] 9.3 Implement signIn (call adapter, fetch user profile)
- [x] 9.4 Implement signOut (call adapter, clear local state)
- [x] 9.5 Implement resetPassword wrapper
- [x] 9.6 Implement subscribeToAuthChanges

## 10. Implement User Service

- [x] 10.1 Create `services/users.ts` with UserService class
- [x] 10.2 Implement getUserById
- [x] 10.3 Implement getUserByUsername
- [x] 10.4 Implement updateProfile
- [x] 10.5 Implement uploadAvatar (uses storage adapter)
- [x] 10.6 Implement followUser / unfollowUser
- [x] 10.7 Implement getFollowers / getFollowing

## 11. Implement Activity Service

- [x] 11.1 Create `services/activities.ts` with ActivityService class
- [x] 11.2 Implement createActivity
- [x] 11.3 Implement getActivityById
- [x] 11.4 Implement getUserActivities
- [x] 11.5 Implement getNearbyActivities (uses queryNearby)
- [x] 11.6 Implement updateActivity (start, pause, complete)
- [x] 11.7 Implement joinActivity / leaveActivity
- [x] 11.8 Implement approveParticipant / declineParticipant

## 12. Implement Post Service

- [x] 12.1 Create `services/posts.ts` with PostService class
- [x] 12.2 Implement createPost (with optional activity link)
- [x] 12.3 Implement getPostById
- [x] 12.4 Implement getFeedPosts (paginated, from followed users)
- [x] 12.5 Implement getUserPosts
- [x] 12.6 Implement likePost / unlikePost
- [x] 12.7 Implement addComment / deleteComment

## 13. Implement Chat Service

- [x] 13.1 Create `services/chats.ts` with ChatService class
- [x] 13.2 Implement createChat (DM or group)
- [x] 13.3 Implement getChatById (with participants)
- [x] 13.4 Implement getUserChats (sorted by last message)
- [x] 13.5 Implement sendMessage
- [x] 13.6 Implement getChatMessages (paginated)
- [x] 13.7 Implement subscribeToMessages (uses realtime adapter)
- [x] 13.8 Implement markAsRead

## 14. Implement Storage Service

- [x] 14.1 Create `services/storage.ts` with StorageService class
- [x] 14.2 Implement uploadAvatar (bucket: avatars)
- [x] 14.3 Implement uploadPostMedia (bucket: posts)
- [x] 14.4 Implement deleteFile
- [x] 14.5 Implement getFileUrl

## 15. Implement Notification Service

- [x] 15.1 Create `services/notification.ts` with NotificationService class
- [x] 15.2 Implement getUserNotifications (paginated)
- [x] 15.3 Implement getUnreadCount
- [x] 15.4 Implement markAsRead / markAllAsRead
- [x] 15.5 Implement subscribeToNotifications (uses realtime adapter)

## 16. Validation

- [x] 16.1 Verify all interfaces are properly typed (no `any`)
- [ ] 16.2 Test mock auth flow (signup → signin → signout)
- [ ] 16.3 Test mock database CRUD operations
- [ ] 16.4 Test mock realtime subscriptions trigger on changes
- [ ] 16.5 Verify AdapterProvider works in app root
- [x] 16.6 Run TypeScript strict mode check (`tsc --noEmit`)
