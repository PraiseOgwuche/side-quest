import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
}

export interface UserPreferences {
  tripLength: 'short' | 'long' | 'day' | 'weekend';
  driverStatus: 'driver' | 'passenger' | 'both';
  hasCar: boolean;
  carType?: 'ev' | 'gas' | 'hybrid';
  foodPreference: 'pitstop_always' | 'pitstop_sometimes' | 'pitstop_never';
  mealType: 'sandwich' | 'meal' | 'flexible';
  eatLocation: 'stop' | 'car' | 'flexible';
  scenicPreference: number; // 1-5
  natureLover: boolean;
  sightseeing: boolean;
}

export interface Stop {
  type: 'fuel' | 'charging' | 'food' | 'scenic' | 'attraction';
  name: string;
  address: string;
  lat: number;
  lng: number;
  duration: number; // minutes
  notes?: string;
}

export interface Itinerary {
  route: {
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    waypoints: Array<{ lat: number; lng: number }>;
  };
  stops: Stop[];
  totalDistance: number; // miles
  totalDuration: number; // minutes
  estimatedCost: {
    fuel: number;
    food: number;
    total: number;
  };
}

export interface TripRecommendation {
  destination: string;
  description: string;
  distance: number;
  estimatedDuration: number;
  matchScore: number; // 0-100
  highlights: string[];
  lat: number;
  lng: number;
}
