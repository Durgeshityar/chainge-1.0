# Change: Add Backend Abstraction Layer

## Why

The app requires a backend-agnostic architecture to enable seamless migration from Supabase to AWS (or other providers). Currently, the `adapters/` folder structure exists but all files are empty. This proposal implements the complete abstraction layer with interface definitions, mock adapters for development, adapter provider context, and frontend service layer.

## What Changes

- **ADDED** `adapters/types.ts` - Complete interface definitions for `IAuthAdapter`, `IDatabaseAdapter`, `IStorageAdapter`, `IRealtimeAdapter`
- **ADDED** `adapters/mock/` - In-memory mock implementations for all adapters (enables frontend development without backend)
- **ADDED** `adapters/AdapterContext.tsx` - React context provider for dependency injection of adapters
- **ADDED** `hooks/useAdapter.ts` - Custom hooks to access adapters from components
- **ADDED** `types/index.ts` - Common data types (User, Activity, Post, Chat, Message, etc.) before Prisma is set up
- **ADDED** `services/` - Domain services that consume adapter interfaces (auth, users, activities, posts, chats, storage, notifications)

## Impact

- Affected specs: `backend-abstraction` (new capability)
- Affected code:
  - `adapters/types.ts` (empty → full interface definitions)
  - `adapters/AdapterContext.ts` (empty → provider implementation)
  - `adapters/mock/*.ts` (empty → mock implementations)
  - `hooks/useAdapter.ts` (new file)
  - `types/index.ts` (empty → type definitions)
  - `services/*.ts` (empty → service implementations)
- Dependencies: None (this is foundational infrastructure)
- Consumers: All future features (auth, profile, nearby, feed, messaging) will depend on this layer
