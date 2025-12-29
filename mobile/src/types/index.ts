export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface UserPreferences {
  tripLength: 'short' | 'long' | 'day' | 'weekend';
  driverStatus: 'driver' | 'passenger' | 'both';
  hasCar: boolean;
  carType?: 'ev' | 'gas' | 'hybrid';
  foodPreference: 'pitstop_always' | 'pitstop_sometimes' | 'pitstop_never';
  mealType: 'sandwich' | 'meal' | 'flexible';
  eatLocation: 'stop' | 'car' | 'flexible';
  scenicPreference: number;
  natureLover: boolean;
  sightseeing: boolean;
}

export interface TripRecommendation {
  destination: string;
  description: string;
  distance: number;
  estimatedDuration: number;
  matchScore: number;
  highlights: string[];
  lat: number;
  lng: number;
}

export interface Stop {
  type: 'fuel' | 'charging' | 'food' | 'scenic' | 'attraction';
  name: string;
  address: string;
  lat: number;
  lng: number;
  duration: number;
  notes?: string;
}

export interface Trip {
  id: string;
  destination: string;
  destinationLat: number;
  destinationLng: number;
  itineraryData: {
    route: {
      startLat: number;
      startLng: number;
      endLat: number;
      endLng: number;
      waypoints: Array<{ lat: number; lng: number }>;
    };
    stops: Stop[];
    totalDistance: number;
    totalDuration: number;
    estimatedCost: {
      fuel: number;
      food: number;
      total: number;
    };
  };
  estimatedCost: number;
  distance: number;
  duration: number;
  status: string;
  scheduledDate?: string;
  createdAt: string;
}
