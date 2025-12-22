## 1. State & Data

- [x] Create `stores/feedStore.ts` with posts array, cursor/hasMore, loading/error flags; expose `fetch`, `refresh`, `loadMore`, `like`, `comment`, `share` actions with optimistic updates.
- [x] Extend `services/posts.ts` (via adapters) for feed pagination, like/unlike, comment create, share payload (chat handoff), and detail fetch; ensure mock adapter parity.

## 2. UI Components

- [x] Build `components/feed/PostCard.tsx` using existing `Card`, `Avatar`, `IconButton`, `BottomSheet` overlay styles; support two templates (immersive photo card and compact text card) with header, overlay title, activity meta row, engagement row, double-tap like, heart animation, and media mute toggle.
- [x] Build `components/feed/CommentSheet.tsx` on `BottomSheet` with drag handle, close button, comment count chip, scrollable list, skeleton/loading state, and anchored input/send control; wire to feed store actions.
- [x] Build `components/feed/ShareSheet.tsx` on `BottomSheet` with options (copy link, share to chat picker, system share) and callbacks for completion/errors.

## 3. Screens & Navigation

- [x] Implement `app/(tabs)/feed.tsx` with vertical snap/ paging FlatList (full-height items), pull-to-refresh, infinite scroll, empty state, and gesture-safe overlays; integrate PostCard actions to open sheets.
- [x] Implement `app/post/[id].tsx` (detail) mirroring PostCard layout in scrollable view with persistent comments section, share/options in header, and navigation from feed items.

## 4. Validation

- [x] Verify two post sizes render per design (immersive hero image card + compact text card) on common iOS/Android breakpoints; check notch/home indicator padding.
- [x] Exercise gestures: double-tap like animation, tap like toggle, comment sheet open/close + submit, share sheet options, scroll with sheets partially open.
- [x] Confirm optimistic counts/state remain consistent after refresh/loadMore and that sheets reuse existing primitives (no duplicate bottom sheet implementations).
