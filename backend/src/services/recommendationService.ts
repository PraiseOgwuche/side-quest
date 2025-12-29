import { UserPreferences, TripRecommendation } from '../types';

// Seattle area destinations (MVP hardcoded data)
const DESTINATIONS = [
  {
    name: 'Bainbridge Island',
    description: 'Scenic ferry ride and charming island town with shops, cafes, and waterfront views',
    distance: 25,
    estimatedDuration: 120, // includes ferry
    lat: 47.6262,
    lng: -122.5212,
    tags: ['scenic', 'nature', 'ferry', 'short'],
    hasChargingStations: true,
    foodOptions: 'many',
  },
  {
    name: 'Snoqualmie Falls',
    description: 'Stunning 268-foot waterfall with hiking trails and observation deck',
    distance: 30,
    estimatedDuration: 90,
    lat: 47.5420,
    lng: -121.8374,
    tags: ['nature', 'scenic', 'short', 'attraction'],
    hasChargingStations: true,
    foodOptions: 'limited',
  },
  {
    name: 'Mount Rainier National Park',
    description: 'Iconic mountain views, hiking trails, and pristine wilderness',
    distance: 85,
    estimatedDuration: 180,
    lat: 46.8523,
    lng: -121.7603,
    tags: ['nature', 'scenic', 'long', 'hiking'],
    hasChargingStations: false,
    foodOptions: 'limited',
  },
  {
    name: 'Leavenworth',
    description: 'Bavarian-themed village with shops, restaurants, and mountain scenery',
    distance: 120,
    estimatedDuration: 150,
    lat: 47.5962,
    lng: -120.6615,
    tags: ['scenic', 'long', 'weekend', 'food'],
    hasChargingStations: true,
    foodOptions: 'many',
  },
  {
    name: 'Deception Pass',
    description: 'Dramatic bridge over churning waters, beaches, and hiking trails',
    distance: 80,
    estimatedDuration: 120,
    lat: 48.4043,
    lng: -122.6468,
    tags: ['nature', 'scenic', 'long', 'bridge'],
    hasChargingStations: true,
    foodOptions: 'limited',
  },
  {
    name: 'Woodinville Wine Country',
    description: 'Over 100 wineries and tasting rooms in a scenic valley',
    distance: 20,
    estimatedDuration: 60,
    lat: 47.7543,
    lng: -122.1632,
    tags: ['short', 'food', 'relaxing'],
    hasChargingStations: true,
    foodOptions: 'many',
  },
  {
    name: 'Olympic National Park',
    description: 'Diverse ecosystems from rainforests to beaches to mountains',
    distance: 110,
    estimatedDuration: 180,
    lat: 47.8021,
    lng: -123.6044,
    tags: ['nature', 'scenic', 'weekend', 'hiking'],
    hasChargingStations: false,
    foodOptions: 'limited',
  },
  {
    name: 'La Conner',
    description: 'Historic waterfront town with art galleries, tulip fields (seasonal), and charm',
    distance: 70,
    estimatedDuration: 100,
    lat: 48.3912,
    lng: -122.4968,
    tags: ['scenic', 'short', 'relaxing'],
    hasChargingStations: true,
    foodOptions: 'many',
  },
];

export class RecommendationService {
  async getRecommendations(preferences: UserPreferences): Promise<TripRecommendation[]> {
    const recommendations = DESTINATIONS.map((dest) => {
      const matchScore = this.calculateMatchScore(dest, preferences);

      return {
        destination: dest.name,
        description: dest.description,
        distance: dest.distance,
        estimatedDuration: dest.estimatedDuration,
        matchScore,
        highlights: this.generateHighlights(dest, preferences),
        lat: dest.lat,
        lng: dest.lng,
      };
    });

    // Sort by match score
    return recommendations.sort((a, b) => b.matchScore - a.matchScore);
  }

  private calculateMatchScore(destination: any, preferences: UserPreferences): number {
    let score = 0;

    // Trip length matching (30 points)
    if (preferences.tripLength === 'day' && destination.tags.includes('short')) {
      score += 30;
    } else if (preferences.tripLength === 'weekend' && destination.tags.includes('long')) {
      score += 30;
    } else if (preferences.tripLength === 'short' && destination.distance < 50) {
      score += 25;
    } else if (preferences.tripLength === 'long' && destination.distance > 80) {
      score += 25;
    }

    // Nature preference (20 points)
    if (preferences.natureLover && destination.tags.includes('nature')) {
      score += 20;
    }

    // Sightseeing preference (15 points)
    if (preferences.sightseeing && destination.tags.includes('attraction')) {
      score += 15;
    }

    // Scenic preference (15 points)
    if (preferences.scenicPreference >= 4 && destination.tags.includes('scenic')) {
      score += 15;
    }

    // Car type consideration (10 points)
    if (preferences.carType === 'ev') {
      if (destination.hasChargingStations) {
        score += 10;
      } else {
        score -= 15; // Penalize if no charging stations
      }
    }

    // Food preference (10 points)
    if (preferences.foodPreference === 'pitstop_always' && destination.foodOptions === 'many') {
      score += 10;
    } else if (preferences.foodPreference === 'pitstop_never' && destination.foodOptions === 'limited') {
      score += 5;
    }

    return Math.min(100, Math.max(0, score)); // Ensure 0-100 range
  }

  private generateHighlights(destination: any, preferences: UserPreferences): string[] {
    const highlights: string[] = [];

    if (destination.tags.includes('scenic')) {
      highlights.push('Scenic route');
    }
    if (destination.tags.includes('nature')) {
      highlights.push('Nature experience');
    }
    if (preferences.carType === 'ev' && destination.hasChargingStations) {
      highlights.push('EV charging available');
    }
    if (destination.foodOptions === 'many') {
      highlights.push('Multiple dining options');
    }
    if (preferences.tripLength === 'day' && destination.distance < 50) {
      highlights.push('Perfect day trip');
    }

    return highlights;
  }
}
