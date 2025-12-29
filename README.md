# Side Quest

A mobile app that provides personalized road trip recommendations based on user preferences.

## Overview

Side Quest helps users discover and plan road trips tailored to their specific preferences:
- Trip length (day trips, weekend getaways)
- Driving preferences (driver, passenger, or both)
- Vehicle type (EV, gas, hybrid)
- Food preferences (pit-stops, meal types)
- Scenic route preferences
- Interest in nature and sightseeing

The app generates complete itineraries including:
- Optimized routes
- Fuel/charging stops
- Food recommendations
- Scenic viewpoints
- Cost estimates
- Travel time calculations

## Project Structure

```
side-quest/
├── backend/          # Node.js/Express API with PostgreSQL
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── types/
│   ├── prisma/       # Database schema
│   └── package.json
│
├── mobile/           # React Native mobile app
│   ├── src/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── contexts/
│   │   ├── services/
│   │   └── types/
│   └── package.json
│
└── README.md
```

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT tokens
- **Validation**: Zod

### Mobile App
- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Navigation**: React Navigation
- **Maps**: React Native Maps
- **State Management**: React Context + AsyncStorage

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Create PostgreSQL database
createdb sidequest

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

The API will be available at `http://localhost:3000`

### 2. Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install

# Update API URL in src/services/api.ts
# For iOS Simulator: http://localhost:3000/api
# For Android Emulator: http://10.0.2.2:3000/api
# For physical device: http://YOUR_COMPUTER_IP:3000/api

# Start Expo
npm start

# Run on device
npm run ios    # iOS Simulator
npm run android # Android Emulator
```

## Features

### V1 (MVP)
- ✅ User authentication
- ✅ Comprehensive onboarding questionnaire
- ✅ Personalized trip recommendations
- ✅ Detailed itinerary generation
- ✅ EV charging station integration
- ✅ Cost estimation (fuel + food)
- ✅ Map integration
- ✅ Trip sharing/invites

### V2 (Planned)
- Spotify playlist recommendations for drives
- Real-time traffic integration
- Weather forecasts
- User reviews and ratings
- Photo uploads and sharing

### Future Versions
- Calendar integration
- PTO-based trip suggestions
- Budget planning tools
- Social features (trip feeds, comments)
- Group trip planning
- Offline mode

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login

### Onboarding
- `POST /api/onboarding/preferences` - Save preferences
- `GET /api/onboarding/preferences` - Get preferences

### Trips
- `GET /api/trips/recommendations` - Get personalized recommendations
- `POST /api/trips/generate` - Generate trip itinerary
- `GET /api/trips` - Get user's trips
- `GET /api/trips/:id` - Get specific trip
- `POST /api/trips/:id/invite` - Invite user to trip
- `POST /api/trips/:id/respond` - Accept/decline invitation

## Database Schema

- **users** - User accounts
- **user_preferences** - User travel preferences
- **trips** - Generated trip itineraries
- **trip_participants** - Trip invitations and participants

## Development

### Backend Development
```bash
cd backend
npm run dev          # Start dev server with hot reload
npm run build        # Build TypeScript
npm run prisma:studio # Open Prisma Studio (DB GUI)
```

### Mobile Development
```bash
cd mobile
npm start           # Start Expo
npm run ios         # Run on iOS
npm run android     # Run on Android
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/sidequest
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

## Contributing

This is a personal project built for learning and demonstration purposes.

## License

MIT

## Roadmap

**Current State**: MVP complete with core functionality

**Next Steps**:
1. Add Google Maps API integration for real routes
2. Implement Google Places API for real venue data
3. Add Spotify API for playlist recommendations
4. Calendar integration
5. Enhanced social features
6. Push notifications for trip reminders
7. Offline support

## Notes

The current version uses hardcoded destination data for Seattle area trips. For production:
- Integrate Google Maps Directions API for real routes
- Use Google Places API for venue recommendations
- Add distance matrix API for accurate travel times
- Implement geocoding for any starting location
- Add weather API integration
- Include real-time traffic data 
