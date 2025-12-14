# Change: Activity tracking store and location hook foundation

## Why

- The Home/Activity module cannot start without shared state for live sessions and scheduled runs, and there is no location utility to request permissions or stream GPS data.
- Tasks 6.1 and 6.2 in `TASKS.md` are blocked until we define the app-level store and location hook behavior.

## What Changes

- Add an activity tracking Zustand store that manages `currentActivity`, `scheduledActivities`, and `trackingData` with lifecycle actions (start, pause, resume, stop/reset) and derived stats.
- Add a `useLocation` hook that requests permissions, fetches current position, starts/stops foreground tracking, and surfaces derived distance/pace plus permission/denied states.
- Document integration expectations so UI, services, and mock adapters can consume the new state and callbacks consistently.

## Impact

- Affected specs: `activity-tracking`
- Affected code: `stores/activityStore.ts`, `hooks/useLocation.ts`, related types in `types/` and adapter-facing services for activity tracking.
