## 1. Implementation

- [x] 1.1 Define shared activity tracking types (activity session, tracking point, tracking status/enums) in `types/` to match store needs.
- [x] 1.2 Implement `stores/activityStore.ts` with `currentActivity`, `scheduledActivities`, `trackingData`, derived stats, and lifecycle actions (start/pause/resume/stop/reset, addTrackPoint).
- [x] 1.3 Implement `hooks/useLocation.ts` to request permissions, fetch current location, start/stop foreground tracking callbacks, and expose permission/denied/error states.
- [x] 1.4 Connect location hook outputs to store expectations (shape of track points, metric updates) and document any adapter/service touchpoints.
- [x] 1.5 Add basic validation (unit tests or lightweight harness) to confirm permission denied path, start/stop flows, and stat calculations per scenarios.
