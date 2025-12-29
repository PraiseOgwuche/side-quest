# Side Quest - System Architecture

## Overview
Side Quest is a mobile app that provides personalized road trip recommendations based on user preferences.

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT tokens
- **External APIs**:
  - Google Maps API (routing, places, distance matrix)
  - OpenWeather API (weather data)

### Mobile App
- **Framework**: React Native (cross-platform iOS/Android)
- **State Management**: React Context + AsyncStorage
- **Navigation**: React Navigation
- **Maps**: react-native-maps

## Database Schema

### Users
- id, email, password_hash, created_at, updated_at

### UserPreferences
- user_id, trip_length, driver_status, has_car, car_type, food_preference, scenic_preference, etc.

### Trips
- id, user_id, destination, itinerary_data, estimated_cost, distance, duration, created_at

### TripParticipants
- trip_id, user_id, status (invited/accepted/declined)

## System Flow

1. **Onboarding**: User signs up → Answers preference questions → Preferences stored
2. **Recommendation**: User requests trips → Engine filters by preferences → Returns ranked options
3. **Itinerary Generation**: User selects trip → System generates route → Adds stops (fuel/charging, food, sights) → Calculates costs
4. **Trip Sharing**: User invites others → Notifications sent → Participants can view/join

## API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login

### Onboarding
- POST /api/onboarding/preferences
- GET /api/onboarding/preferences

### Trips
- GET /api/trips/recommendations
- POST /api/trips/generate
- GET /api/trips/:id
- POST /api/trips/:id/invite

## MVP Features (V1)
1. User authentication
2. Onboarding questionnaire
3. Basic recommendation engine
4. Itinerary generation with:
   - Optimal routing
   - Fuel/charging stops
   - Food stops
   - Cost estimation
5. Map integration
6. Trip invites
