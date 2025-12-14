import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="name" />
      <Stack.Screen name="username" />
      <Stack.Screen name="birthday" />
      <Stack.Screen name="gender" />
      <Stack.Screen name="height" />
      <Stack.Screen name="weight" />
      <Stack.Screen name="activity-tracker" />
      <Stack.Screen name="interests" />
      <Stack.Screen name="profile-picture" />
      <Stack.Screen name="cover-image" />
      <Stack.Screen name="preview" />
      <Stack.Screen name="location" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
