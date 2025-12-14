## ADDED Requirements

### Requirement: Activity tracking state store

The system SHALL provide a Zustand-backed activity tracking store that holds current session state, scheduled activities, and tracking data with derived metrics (elapsed time, distance, pace) and lifecycle actions (start, pause, resume, stop/reset, add track points).

#### Scenario: Start activity session

- **WHEN** `startActivity` is invoked with an activity type/metadata and no active session
- **THEN** the store SHALL set `currentActivity` status to `active`, record the start time, clear any prior tracking data, and zero derived metrics

#### Scenario: Pause and resume session

- **WHEN** `pauseActivity` is invoked while the session status is `active`
- **THEN** the store SHALL set status to `paused` and preserve existing tracking data without advancing elapsed time
- **WHEN** `resumeActivity` is invoked while status is `paused`
- **THEN** the store SHALL set status back to `active` and continue elapsed calculations from the accumulated time

#### Scenario: Stop and summarize session

- **WHEN** `stopActivity` is invoked for an active or paused session
- **THEN** the store SHALL set status to `completed`, freeze tracking data, compute final totals (elapsed time, distance, average pace), and expose a summary payload for downstream UI or post-processing

### Requirement: Location permission and tracking hook

The system SHALL provide a `useLocation` hook that requests and tracks foreground location permissions, fetches the current position, and starts/stops streaming GPS updates while exposing permission/denied/error states and derived distance/pace from emitted points.

#### Scenario: Permission granted

- **WHEN** the hook requests foreground location permission from an undetermined state and the platform grants it
- **THEN** the hook SHALL set permission status to `granted` and allow location queries and tracking to proceed

#### Scenario: Permission denied

- **WHEN** the permission request or subsequent check returns `denied` or `blocked`
- **THEN** the hook SHALL set status to `denied` and surface an error/flag so the UI can inform the user and skip starting tracking

#### Scenario: Start and stop foreground tracking

- **WHEN** `startTracking` is invoked while permission is `granted`
- **THEN** the hook SHALL begin foreground location updates, emit track points with timestamp/coordinates to consumers, and update derived distance and pace cumulatively
- **WHEN** `stopTracking` is invoked
- **THEN** the hook SHALL halt location updates and retain the last known location and metrics for the activity store to consume
