# Navigation Specification

## ADDED Requirements

### Requirement: Bottom Tab Navigation

The system SHALL provide a bottom tab navigation bar with 5 primary tabs for navigating between main app sections.

#### Scenario: User views tab bar on app launch

- **WHEN** the user opens the app and is authenticated
- **THEN** a bottom tab bar is displayed with 5 tabs: Home, Nearby, Feed, Messages, Profile
- **AND** the Home tab is active by default
- **AND** the tab bar is fixed at the bottom of the screen

#### Scenario: User taps on inactive tab

- **WHEN** the user taps on an inactive tab
- **THEN** the screen content switches to the selected tab
- **AND** the tapped tab becomes active
- **AND** the previously active tab becomes inactive

### Requirement: Custom Tab Bar Styling

The system SHALL display a custom-styled tab bar with circular icon containers and distinctive active/inactive states.

#### Scenario: Tab bar displays with correct styling

- **WHEN** the tab bar is rendered
- **THEN** the background color is deep charcoal (#1c1c1c)
- **AND** the height is 60px
- **AND** each tab item has a circular container (~52px diameter)

#### Scenario: Inactive tab displays correctly

- **WHEN** a tab is not focused/active
- **THEN** the icon is displayed in gray color (#979C9E)
- **AND** the container background is dark gray (#2E2E22)
- **AND** no label is displayed below the icon

#### Scenario: Active tab displays correctly

- **WHEN** a tab is focused/active
- **THEN** the icon is displayed in neon green (#B4FC57)
- **AND** the container has a green-tinted background
- **AND** a label with the tab name is displayed below the icon
- **AND** a small green dot indicator appears with the label

### Requirement: Tab Press Animation

The system SHALL provide visual feedback when a tab is pressed.

#### Scenario: User presses a tab

- **WHEN** the user presses down on a tab item
- **THEN** the tab item scales down slightly (0.95x)
- **AND** the scale returns to normal on release

### Requirement: Profile Tab Avatar

The system SHALL display the user's avatar image in the Profile tab instead of a generic icon.

#### Scenario: User has profile avatar

- **WHEN** the Profile tab is rendered
- **AND** the user has an avatar image
- **THEN** the user's avatar is displayed in a circular container
- **AND** the avatar replaces the standard icon

#### Scenario: User has no profile avatar

- **WHEN** the Profile tab is rendered
- **AND** the user does not have an avatar image
- **THEN** a fallback is displayed (initials or generic user icon)
- **AND** the fallback appears in the same circular container

### Requirement: Messages Tab Notification Badge

The system SHALL display a notification badge on the Messages tab when there are unread messages.

#### Scenario: User has unread messages

- **WHEN** the Messages tab is rendered
- **AND** the unread message count is greater than 0
- **THEN** a badge is displayed on the Messages tab icon
- **AND** the badge shows the unread count

#### Scenario: User has no unread messages

- **WHEN** the Messages tab is rendered
- **AND** the unread message count is 0
- **THEN** no badge is displayed on the Messages tab icon

### Requirement: Tab Screen Placeholders

The system SHALL provide placeholder screens for each tab that display the screen name.

#### Scenario: User navigates to Home tab

- **WHEN** the user is on the Home tab
- **THEN** a screen is displayed with "Home" as the title

#### Scenario: User navigates to Nearby tab

- **WHEN** the user is on the Nearby tab
- **THEN** a screen is displayed with "Nearby" as the title

#### Scenario: User navigates to Feed tab

- **WHEN** the user is on the Feed tab
- **THEN** a screen is displayed with "Feed" as the title

#### Scenario: User navigates to Messages tab

- **WHEN** the user is on the Messages tab
- **THEN** a screen is displayed with "Messages" as the title

#### Scenario: User navigates to Profile tab

- **WHEN** the user is on the Profile tab
- **THEN** a screen is displayed with "Profile" as the title
