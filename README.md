# Scanner App

This is a document scanner app built with Expo, following the design and technical guide.

## Features

- Camera scanning with document detection
- Image import from gallery
- Review and edit scanned pages
- Export to PDF
- Share PDF

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Prebuild for native code (required for document scanner plugin):
   ```
   npx expo prebuild
   ```

3. Start the development server:
   ```
   npx expo start
   ```

## Deployment

Since this app uses native libraries, it requires a development build and cannot run in Expo Go.

### Using EAS Build

1. Install EAS CLI:
   ```
   npm install -g @expo/eas-cli
   ```

2. Login to your Expo account:
   ```
   eas login
   ```

3. Configure EAS (if needed):
   ```
   eas build:configure
   ```

4. Build for Android:
   ```
   eas build --platform android
   ```

5. Build for iOS:
   ```
   eas build --platform ios
   ```

6. Download the build from the Expo dashboard and submit to app stores.

### Publishing Updates

For updates, use:
```
eas update
```

## Project Structure

- `src/app/`: Screens and routing
- `src/components/`: Reusable UI components
- `src/hooks/`: Custom hooks
- `src/utils/`: Utility functions
- `src/store/`: Global state management