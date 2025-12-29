# Side Quest Backend API

Backend API for the Side Quest mobile app - personalized road trip recommendations.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials and secrets
```

3. Set up PostgreSQL database:
```bash
# Create a PostgreSQL database named 'sidequest'
createdb sidequest

# Run migrations
npm run prisma:migrate
```

4. Start development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Onboarding
- `POST /api/onboarding/preferences` - Save user preferences (requires auth)
- `GET /api/onboarding/preferences` - Get user preferences (requires auth)

### Trips
- `GET /api/trips/recommendations` - Get personalized trip recommendations (requires auth)
- `POST /api/trips/generate` - Generate trip itinerary (requires auth)
- `GET /api/trips` - Get user's trips (requires auth)
- `GET /api/trips/:id` - Get specific trip (requires auth)
- `POST /api/trips/:id/invite` - Invite user to trip (requires auth)
- `POST /api/trips/:id/respond` - Accept/decline trip invitation (requires auth)

## Database Schema

- **users** - User accounts
- **user_preferences** - User travel preferences
- **trips** - Generated trip itineraries
- **trip_participants** - Trip invitations and participants

## Tech Stack

- Node.js + Express
- TypeScript
- PostgreSQL + Prisma ORM
- JWT authentication
- Zod validation
