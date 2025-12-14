<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->


<!-- AGENT DEVELOPMENT:START -->

# Agent Development Instructions

## 1. Architecture Overview
This project uses a **Backend-Agnostic Adapter Pattern**.
- **UI Layer**: React Native components (never import backend SDKs directly).
- **State Layer**: Zustand stores and TanStack Query.
- **Service Layer**: Business logic wrapping adapters.
- **Adapter Layer**: Abstract interfaces (`IAuthAdapter`, `IDatabaseAdapter`) that define backend operations.
- **Implementation Layer**: Concrete implementations (Mock, Supabase, AWS).

## 2. Development Sequence
When implementing a new feature, you **MUST** follow this sequence:

### Step 1: Define Types
- Define domain entities in `types/index.ts` or `adapters/types.ts`.
- Ensure types match the Prisma schema where applicable.

### Step 2: Define Adapter Interface
- Add methods to the appropriate interface in `adapters/types.ts` (e.g., `IDatabaseAdapter`).
- Define input/output types clearly.

### Step 3: Implement Mock Adapter
- Implement the new methods in `adapters/mock/*.ts`.
- Use in-memory arrays or local storage to simulate backend behavior.
- **Crucial**: This allows UI development to proceed without a real backend.

### Step 4: Create/Update Store & Service
- Create a Zustand store in `stores/` (e.g., `useGoalStore`).
- Use `useAdapter()` hook to access the adapter.
- Implement actions that call the adapter methods.

### Step 5: Build UI Components
- Create components in `components/` using the Atomic Design principle.
- Use the store hooks to fetch data and trigger actions.
- **Never** call adapters directly from components; use the store or service.

## 3. Key Rules
- **No Direct Backend Calls**: UI components must never import `supabase-js` or `firebase` directly.
- **Use Mocks First**: Always validate logic with mocks before worrying about the real backend.
- **Strict Typing**: Use TypeScript strictly. No `any`.
- **File Naming**:
  - Components: `PascalCase.tsx`
  - Hooks/Functions: `camelCase.ts`
  - Screens: `kebab-case` (Expo Router)

<!-- AGENT DEVELOPMENT:END -->