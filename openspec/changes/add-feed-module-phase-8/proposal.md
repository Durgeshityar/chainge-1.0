# Change: Phase 8 Feed Module (Frontend)

## Why

- Deliver the feed experience shown in the provided Figma reference so users can browse mixed post formats (immersive photo cards and compact text cards) and engage via likes, comments, and sharing.

## What Changes

- Add a feed store plus supporting services for paginated fetching, refresh, and optimistic engagement updates.
- Build reusable feed UI: immersive and compact `PostCard` templates with header, activity meta, engagement row, and media controls (per visual reference: two distinct card heights/styles).
- Add `CommentSheet` and `ShareSheet` bottom sheets leveraging existing bottom sheet component; wire double-tap like, comment, share flows, and heart animations.
- Implement feed screen with vertical snap scrolling, pagination, pull-to-refresh, and empty state; add post detail screen with comment thread.

## Impact

- Affected specs: feed
- Affected code: app/(tabs)/feed.tsx, app/post/[id].tsx, components/feed/\*, stores/feedStore.ts, services/posts.ts (and adapters via services)
