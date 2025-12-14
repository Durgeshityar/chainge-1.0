# Capability: Backend Abstraction

Backend abstraction layer that enables provider-agnostic backend interactions, supporting seamless migration between Supabase, AWS, or other backends without frontend changes.

## ADDED Requirements

### Requirement: Adapter Interface Definitions

The system SHALL define abstract TypeScript interfaces for all backend operations (authentication, database, storage, realtime) that provider-specific implementations must fulfill.

#### Scenario: Auth adapter interface completeness

- **WHEN** a developer implements IAuthAdapter
- **THEN** they MUST implement signUpWithEmail, signInWithEmail, signInWithGoogle, signInWithApple, signOut, resetPassword, onAuthStateChange, getCurrentUser, and getSession methods

#### Scenario: Database adapter interface completeness

- **WHEN** a developer implements IDatabaseAdapter
- **THEN** they MUST implement get, list, create, update, delete, query, queryNearby, and paginate methods with proper generic type parameters

#### Scenario: Storage adapter interface completeness

- **WHEN** a developer implements IStorageAdapter
- **THEN** they MUST implement upload, download, delete, and getPublicUrl methods

#### Scenario: Realtime adapter interface completeness

- **WHEN** a developer implements IRealtimeAdapter
- **THEN** they MUST implement subscribe, subscribeToTable, broadcast, and presence methods

---

### Requirement: Common Type Definitions

The system SHALL define TypeScript types for all domain entities (User, Activity, Post, Chat, Message, Notification, etc.) that are consistent across all adapter implementations.

#### Scenario: Entity type availability

- **WHEN** importing from `@/types`
- **THEN** all domain entity types (User, Activity, ActivityParticipant, Post, PostLike, PostComment, Chat, ChatParticipant, Message, Notification, Follow) SHALL be available

#### Scenario: Enum type availability

- **WHEN** importing from `@/types`
- **THEN** all enum types (ActivityStatus, Visibility, ParticipantStatus, ChatType, NotificationType) SHALL be available

#### Scenario: Type consistency with Prisma schema

- **WHEN** types are defined in `types/index.ts`
- **THEN** they SHALL match the field names and types specified in the Prisma schema from SRS.md

---

### Requirement: Mock Adapter Implementation

The system SHALL provide mock adapter implementations that enable frontend development and testing without a real backend connection.

#### Scenario: Mock auth sign up

- **WHEN** signUpWithEmail is called with valid email and password
- **THEN** a new user SHALL be created in mock storage
- **AND** an AuthResult with user and session SHALL be returned

#### Scenario: Mock auth sign in with invalid credentials

- **WHEN** signInWithEmail is called with non-existent email
- **THEN** an AuthResult with error SHALL be returned
- **AND** user and session SHALL be null

#### Scenario: Mock database create and retrieve

- **WHEN** create<T> is called with valid data
- **THEN** a new record with generated id and timestamps SHALL be stored
- **AND** get<T> with that id SHALL return the created record

#### Scenario: Mock database query with filters

- **WHEN** query<T> is called with filters (e.g., `[{field: 'status', op: 'eq', value: 'SCHEDULED'}]`)
- **THEN** only records matching all filters SHALL be returned

#### Scenario: Mock nearby query

- **WHEN** queryNearby<T> is called with coordinates and radius
- **THEN** only records within the specified radius SHALL be returned

#### Scenario: Mock storage upload and download

- **WHEN** upload is called with a file
- **THEN** the file SHALL be stored in memory
- **AND** download with the same path SHALL return the file content

#### Scenario: Mock realtime subscription

- **WHEN** subscribeToTable is called
- **AND** a record is created/updated via the database adapter
- **THEN** the subscription callback SHALL be invoked with the change data

---

### Requirement: Adapter Provider Context

The system SHALL provide a React Context that injects adapter implementations throughout the component tree, enabling environment-based adapter switching.

#### Scenario: Provider wraps application

- **WHEN** AdapterProvider wraps the app component tree
- **THEN** all child components SHALL have access to adapter instances via context

#### Scenario: Environment-based adapter selection

- **WHEN** the app initializes
- **THEN** the adapter provider SHALL select mock, supabase, or aws adapters based on environment configuration

#### Scenario: Hook access to adapters

- **WHEN** useAuth, useDatabase, useStorage, or useRealtime hooks are called within AdapterProvider
- **THEN** the corresponding adapter instance SHALL be returned

---

### Requirement: Service Layer Abstraction

The system SHALL provide domain services that encapsulate business logic and interact with adapters, shielding UI components from direct adapter usage.

#### Scenario: Auth service signup flow

- **WHEN** AuthService.signUp is called
- **THEN** the auth adapter signUpWithEmail SHALL be invoked
- **AND** a user profile SHALL be created via the database adapter

#### Scenario: User service follow operation

- **WHEN** UserService.followUser is called
- **THEN** a Follow record SHALL be created via the database adapter
- **AND** the follower/following counts MAY be updated

#### Scenario: Activity service nearby discovery

- **WHEN** ActivityService.getNearbyActivities is called with location
- **THEN** the database adapter queryNearby SHALL be invoked
- **AND** only public/scheduled activities SHALL be returned

#### Scenario: Chat service real-time messages

- **WHEN** ChatService.subscribeToMessages is called
- **THEN** the realtime adapter subscribeToTable SHALL be invoked
- **AND** new messages SHALL trigger the provided callback

#### Scenario: Post service feed retrieval

- **WHEN** PostService.getFeedPosts is called
- **THEN** posts from followed users SHALL be retrieved via paginate
- **AND** results SHALL be ordered by creation date descending

---

### Requirement: Type Safety

The system SHALL maintain full TypeScript type safety across all adapter interfaces, implementations, and service methods.

#### Scenario: Generic type inference

- **WHEN** database adapter get<User> is called
- **THEN** the return type SHALL be `Promise<User | null>`
- **AND** TypeScript SHALL enforce User type on the result

#### Scenario: No any types in public API

- **WHEN** adapter interfaces or service methods are defined
- **THEN** no `any` type SHALL be used in parameter or return types
- **AND** `unknown` with type guards SHALL be used where dynamic typing is necessary
