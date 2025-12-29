import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserPreferences, TripRecommendation, Trip } from '../types';

// Update this to your backend URL
const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async register(email: string, password: string, name?: string): Promise<{ user: User; token: string }> {
    const response = await api.post('/auth/register', { email, password, name });
    await AsyncStorage.setItem('token', response.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await api.post('/auth/login', { email, password });
    await AsyncStorage.setItem('token', response.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  async getCurrentUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

export const onboardingService = {
  async savePreferences(preferences: UserPreferences): Promise<void> {
    await api.post('/onboarding/preferences', preferences);
  },

  async getPreferences(): Promise<UserPreferences | null> {
    try {
      const response = await api.get('/onboarding/preferences');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};

export const tripService = {
  async getRecommendations(): Promise<TripRecommendation[]> {
    const response = await api.get('/trips/recommendations');
    return response.data;
  },

  async generateTrip(destination: string, destinationLat: number, destinationLng: number): Promise<{ trip: Trip; itinerary: any }> {
    const response = await api.post('/trips/generate', {
      destination,
      destinationLat,
      destinationLng,
    });
    return response.data;
  },

  async getUserTrips(): Promise<Trip[]> {
    const response = await api.get('/trips');
    return response.data;
  },

  async getTrip(id: string): Promise<Trip> {
    const response = await api.get(`/trips/${id}`);
    return response.data;
  },

  async inviteToTrip(tripId: string, email: string): Promise<void> {
    await api.post(`/trips/${tripId}/invite`, { email });
  },

  async respondToInvite(tripId: string, status: 'accepted' | 'declined'): Promise<void> {
    await api.post(`/trips/${tripId}/respond`, { status });
  },
};
