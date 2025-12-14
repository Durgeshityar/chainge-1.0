# Chainge — Product Requirements Document

## 1. Elevator Pitch

Chainge is a social-fitness app that solves the "I have no one to work out with" problem. It combines Strava-style activity tracking, Hinge-inspired local discovery, and Instagram-like social sharing into one platform. Users can find nearby people planning to play or exercise, join their sessions with one tap, and build genuine fitness connections—turning solo workouts into social experiences for urban 16-35 year olds who want community without the friction of traditional sports clubs.

---

## 2. Who Is This App For

**Primary User:** Urban fitness enthusiasts (16-35) who:
- Want workout partners but lack access to sports communities or groups
- Participate in trendy individual or small-group activities (basketball, running, tennis, gym, yoga, etc.)
- Are comfortable with app-based social discovery
- Value flexibility over rigid schedules or memberships

**User Persona:**
> *Priya, 24, lives in Bangalore. She moved for work and doesn't know anyone who plays badminton. She's tired of playing alone or scrolling WhatsApp groups hoping someone's free. She wants to open an app, see who's playing nearby in the next hour, and just show up.*

---

## 3. Functional Requirements

### 3.1 Home (Activity Hub)

| Feature | Description |
|---------|-------------|
| Instant Start | One-tap to begin an activity now |
| Schedule Activity | Plan a future session (visible on Nearby) |
| GPS Tracking | Real-time tracking for running, cycling with metrics (time, distance, pace, route) |
| Auto-Draft Post | Activity summary generated on completion; user can edit and publish |
| Activity Library | 10-20 supported activities (running, cycling, basketball, tennis, gym, yoga, hiking, swimming, badminton, football, volleyball, skateboarding, etc.) |

### 3.2 Nearby (Discovery)

| Feature | Description |
|---------|-------------|
| Real-Time Feed | Shows users with scheduled/active sessions within 20-30km |
| Join/Pass | Swipe or tap to request joining an activity |
| Host Approval | Notification sent to host; approve/decline joiners |
| Match to DM | Approved requests open a direct message thread |
| Filters | By activity type, time, distance |

### 3.3 Profile

| Feature | Description |
|---------|-------------|
| Two Tabs | **Wingman** (gamified intro) / **Posts** (activity history) |
| Wingman Card | AI-generated intro: *"I'm Durgesh's wingman. He's into basketball—I think you two would be a great pair."* |
| Personal Info | Bio, location, interests, stats |
| Settings | Account, privacy, notifications, preferences |
| Follow System | One-way follows, no approval required |

### 3.4 Messaging & Notifications

| Feature | Description |
|---------|-------------|
| 1-on-1 DMs | Text chat between two users |
| Group Chats | For recurring workout groups |
| Notifications Tab | Join requests, approvals, activity reminders, social updates |
| Push Notifications | Real-time alerts for time-sensitive actions |

### 3.5 Feed

| Feature | Description |
|---------|-------------|
| Vertical Scroll | Instagram Reels-style full-screen cards |
| Content | Activity posts from followed users |
| Engagement | Like, comment, share |
| Post Format | Activity summary, route map (if GPS), photos, caption |

---

## 4. User Stories

### Discovery & Joining
- *As a user, I want to see who's working out nearby so I can find a partner.*
- *As a user, I want to request to join someone's activity and get notified when approved.*
- *As a host, I want to approve or decline join requests before sharing my location.*

### Activity Tracking
- *As a runner, I want GPS tracking with pace and distance so I can monitor performance.*
- *As a user, I want to schedule a future activity so others can discover and join me.*
- *As a user, I want the app to auto-generate a post after my workout so sharing is effortless.*

### Social & Profile
- *As a user, I want a Wingman intro that tells others what I'm into without writing a bio.*
- *As a user, I want to follow interesting people and see their posts in my feed.*
- *As a user, I want to browse a vertical feed of activity posts from my connections.*

### Messaging
- *As a user, I want to DM someone after we match on an activity.*
- *As a user, I want to create group chats with my regular workout crew.*

---

## 5. User Interface

### Design System

| Element | Direction |
|---------|-----------|
| Mode | Dark theme (primary) |
| Typography | Clean, modern sans-serif |
| Palette | Dark backgrounds, vibrant accent colors for activity types |
| Motion | Smooth transitions, satisfying micro-interactions |

### Screen-by-Screen Inspiration

| Screen | Reference | Notes |
|--------|-----------|-------|
| **Feed** | Instagram Reels | Full-screen vertical cards, swipe navigation |
| **Nearby** | Hinge | Card-based discovery, Join/Pass actions |
| **Home** | Strava | Activity picker, big start button, live metrics |
| **Profile** | Instagram | Header with stats, tabbed content below |
| **Messaging** | Standard chat UI | Conversation list + thread view |

### Navigation

- Bottom tab bar: **Home** · **Nearby** · **Feed** · **Messages** · **Profile**
- Notifications accessible from Messages tab or header icon
