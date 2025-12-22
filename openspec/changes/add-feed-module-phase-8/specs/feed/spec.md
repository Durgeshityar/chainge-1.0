## ADDED Requirements

### Requirement: Feed Retrieval and Pagination

The system SHALL fetch the feed as a paginated list (cursor-based) ordered by recency, exposing actions to refresh and load more while tracking `hasMore`.

#### Scenario: Initial load

- **WHEN** the user opens the Feed tab
- **THEN** the first page of posts is loaded and rendered starting at the top of the list

#### Scenario: Pull to refresh

- **WHEN** the user pulls down on the feed
- **THEN** the list refreshes from the first page and resets the cursor and `hasMore` state

#### Scenario: Load more

- **WHEN** the user scrolls near the end of the loaded posts
- **THEN** the next page loads using the cursor until `hasMore` is false

#### Scenario: Empty state

- **WHEN** no posts are returned
- **THEN** an empty-state view is shown instead of a blank list

### Requirement: Feed Layout and Snap Scrolling

The feed SHALL render one post per viewport, using snap scrolling aligned to the post height and supporting two card sizes (immersive hero and compact text cards).

#### Scenario: Snap between mixed card heights

- **WHEN** the user scrolls vertically
- **THEN** the list snaps so the next card (hero or compact) is top-aligned and occupies its intended height without overlap

### Requirement: Immersive Post Card (Hero)

The system SHALL render media-first posts with a hero card that fills most of the viewport, featuring a darkened media background, centered overlay title, user header, activity meta, engagement row, and a media mute/unmute control.

#### Scenario: Hero card display

- **WHEN** a post includes media marked as hero
- **THEN** the card shows the media as the background with a dark overlay, the title near the top center, the user header (avatar, name, location, timestamp) at the top, and the activity row plus engagement row at the bottom

#### Scenario: Double-tap like on hero card

- **WHEN** the user double-taps the hero card
- **THEN** the post is liked optimistically, counts update, and a heart burst animation appears

#### Scenario: Media mute toggle

- **WHEN** the user taps the volume control on a hero card with audio
- **THEN** audio playback toggles between muted and unmuted states

### Requirement: Compact Post Card (Text)

The system SHALL render text-forward posts with a compact card that uses a solid color background, caption text, sport badge, time/duration meta, and the same engagement row as hero cards.

#### Scenario: Compact card display

- **WHEN** a post is text-only or marked compact
- **THEN** the compact card is shown with the caption, sport badge, duration meta, and engagement row visible without media

### Requirement: Engagement Actions

Posts SHALL expose like, comment, share, and options actions with visible counts; likes support both button tap and double-tap on the card, with optimistic updates and animations.

#### Scenario: Like/unlike via button

- **WHEN** the user taps the like button
- **THEN** the like state toggles with a fill animation and the count updates optimistically

#### Scenario: Comment entry point

- **WHEN** the user taps the comment action
- **THEN** the CommentSheet opens for that post and focuses the list near the latest comments

#### Scenario: Share entry point

- **WHEN** the user taps the share action
- **THEN** the ShareSheet opens with share options for that post

### Requirement: CommentSheet

The system SHALL present a bottom sheet for comments with a drag handle, close control, comment count header, scrollable list of comment items (avatar, name, text, time), loading state, and an anchored input with send action.

#### Scenario: View comments

- **WHEN** the CommentSheet opens
- **THEN** existing comments load with a loading state and render in order with avatars, names, text, and relative time

#### Scenario: Add comment

- **WHEN** the user enters text and taps send
- **THEN** the comment posts optimistically, appears in the list, and clears the input

#### Scenario: Dismiss sheet

- **WHEN** the user drags down or taps close
- **THEN** the sheet dismisses and returns to the feed without altering scroll position

### Requirement: ShareSheet

The system SHALL present a bottom sheet for sharing with options to copy link, share to an in-app chat (via chat picker), and invoke the native/system share sheet.

#### Scenario: Copy link

- **WHEN** the user selects copy link
- **THEN** the post URL is copied and a confirmation/feedback toast is shown

#### Scenario: Share to chat

- **WHEN** the user selects share to chat
- **THEN** the chat picker opens and, after selection, a share payload is sent to that chat

#### Scenario: System share

- **WHEN** the user selects external share
- **THEN** the native share sheet opens prefilled with the post link

### Requirement: Post Detail Screen

The system SHALL provide a post detail view at `app/post/[id].tsx` that mirrors the PostCard layout in a scrollable page and keeps the comments thread visible below the media/content.

#### Scenario: Open post detail

- **WHEN** the user taps a post or deep-links to `/post/{id}`
- **THEN** the detail screen opens with the full post content, engagement actions, and the comments section available without opening a sheet

#### Scenario: Comment from detail

- **WHEN** the user submits a comment in the detail view
- **THEN** the comment appears in the thread and counts update consistently with the feed
