# Side Quest Mobile App

React Native mobile app for personalized road trip recommendations.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Update API URL:
- Edit `src/services/api.ts`
- Change `API_URL` to point to your backend server
  - For iOS Simulator: `http://localhost:3000/api`
  - For Android Emulator: `http://10.0.2.2:3000/api`
  - For physical device: `http://YOUR_COMPUTER_IP:3000/api`

3. Start the development server:
```bash
npm start
```

4. Run on device:
```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web
npm run web
```

## Features

- User authentication (register/login)
- Interactive onboarding questionnaire
- Personalized trip recommendations
- Detailed trip itineraries with maps
- Cost breakdowns (fuel + food)
- Trip invitations and sharing
- Profile management

## Tech Stack

- React Native with Expo
- TypeScript
- React Navigation
- React Native Maps
- Axios for API calls
- AsyncStorage for local data

## Screens

1. **Login/Register** - User authentication
2. **Onboarding** - Preference questionnaire
3. **Home** - Trip recommendations
4. **Trips** - User's saved trips
5. **Trip Detail** - Full itinerary with map
6. **Profile** - User settings and logout
