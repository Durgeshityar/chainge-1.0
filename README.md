# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Supabase Authentication Setup

The adapter layer now includes a Supabase-auth implementation. Configure these environment variables (e.g., in an `.env` file or via your shell) before running the app:

```bash
export EXPO_PUBLIC_SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
export EXPO_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY"
# Optional: override the redirect if you use a custom deep link
export EXPO_PUBLIC_SUPABASE_REDIRECT_URL="chainge://auth-callback"
# Optional: switch between the Supabase backend and the local mock backend
export EXPO_PUBLIC_BACKEND_PROVIDER="supabase" # or "mock"
```

The Expo config already declares the `chainge` scheme; update it if you change the redirect URL. The Supabase auth, database, storage, and realtime adapters are now wired into the `AdapterProvider`, so setting `EXPO_PUBLIC_BACKEND_PROVIDER` to `supabase` (the default) will use your Supabase project. Set it to `mock` if you need the seeded in-memory backend for local development.
