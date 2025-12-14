import { Tabs } from 'expo-router';
import { TabBar } from '../../components/layout/TabBar';

export default function TabLayout() {
  // TODO: Get these from auth store when implemented
  const unreadCount = 3; // Placeholder
  const userAvatarUrl = undefined; // Will be fetched from user profile
  const userName = 'User';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => (
        <TabBar
          {...props}
          unreadCount={unreadCount}
          userAvatarUrl={userAvatarUrl}
          userName={userName}
        />
      )}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="nearby"
        options={{
          title: 'Nearby',
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
