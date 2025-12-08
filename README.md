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




# BusBeacon - Expo Export

This folder contains the React Native (Expo) version of the BusBeacon app, converted from the web React version.

## Prerequisites

Make sure you have the following installed in your Expo project:

```bash
# Core dependencies
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar

# Storage
npx expo install @react-native-async-storage/async-storage

# Icons (use lucide-react-native)
npm install lucide-react-native react-native-svg

# NativeWind (Tailwind CSS for React Native)
npm install nativewind
npm install --save-dev tailwindcss@3.3.2
```

## File Structure

```
expo-export/
├── app/
│   ├── _layout.tsx          # Root layout with AuthProvider
│   ├── index.tsx            # Entry point with auth redirect
│   ├── (auth)/
│   │   ├── _layout.tsx      # Auth stack layout
│   │   ├── sign-in.tsx      # Phone number input
│   │   ├── otp.tsx          # OTP verification
│   │   └── terms.tsx        # Terms acceptance
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Tab navigator layout
│   │   ├── index.tsx        # Home screen
│   │   ├── route.tsx        # Route stops screen
│   │   ├── students.tsx     # Student list screen
│   │   └── report.tsx       # Report issue screen
│   ├── notifications.tsx    # Notifications screen
│   └── profile.tsx          # Profile screen
├── contexts/
│   └── AuthContext.tsx      # Authentication context
├── services/
│   ├── api.ts               # API service (dummy data)
│   └── storage.ts           # AsyncStorage service
├── global.css               # NativeWind styles
├── tailwind.config.js       # Tailwind configuration
└── README.md
```

## Setup Instructions

1. Copy all files from this folder to your Expo project root
2. Install dependencies listed above
3. Configure NativeWind in your `babel.config.js`:
   ```js
   module.exports = function (api) {
     api.cache(true);
     return {
       presets: [
         ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
         'nativewind/babel',
       ],
     };
   };
   ```
4. Add to your `metro.config.js`:
   ```js
   const { getDefaultConfig } = require('expo/metro-config');
   const { withNativeWind } = require('nativewind/metro');
   
   const config = getDefaultConfig(__dirname);
   
   module.exports = withNativeWind(config, { input: './global.css' });
   ```
5. Update your `app.json` to enable Expo Router:
   ```json
   {
     "expo": {
       "scheme": "busbeacon",
       "web": {
         "bundler": "metro"
       }
     }
   }
   ```

## Dummy OTP

For testing, use OTP: `000000`

## Replacing with Real APIs

All API calls in `services/api-rest.ts` are commented with `// TODO: Replace with actual API call`. Uncomment and modify the fetch calls with your actual API endpoints.
