import { UserPreferences, Itinerary, Stop } from '../types';
import prisma from '../lib/prisma';

// MVP: Hardcoded stops data (in production, use Google Places API)
const STOPS_DATABASE: Record<string, Stop[]> = {
  'Bainbridge Island': [
    {
      type: 'food',
      name: 'Blackbird Bakery',
      address: '210 Winslow Way E, Bainbridge Island, WA',
      lat: 47.6262,
      lng: -122.5151,
      duration: 30,
      notes: 'Popular bakery and cafe',
    },
    {
      type: 'charging',
      name: 'ChargePoint Station',
      address: 'Town Square, Bainbridge Island',
      lat: 47.6264,
      lng: -122.5213,
      duration: 45,
      notes: 'Level 2 charging while you explore',
    },
  ],
  'Snoqualmie Falls': [
    {
      type: 'attraction',
      name: 'Snoqualmie Falls Viewpoint',
      address: '6501 Railroad Ave SE, Snoqualmie, WA',
      lat: 47.5420,
      lng: -121.8374,
      duration: 30,
      notes: 'Main viewpoint and trails',
    },
    {
      type: 'food',
      name: 'Snoqualmie Falls Cafe',
      address: 'Near falls parking area',
      lat: 47.5422,
      lng: -121.8375,
      duration: 45,
      notes: 'Casual dining with views',
    },
  ],
  'Mount Rainier National Park': [
    {
      type: 'fuel',
      name: 'Ashford Gas Station',
      address: 'Ashford, WA (Last fuel before park)',
      lat: 46.7519,
      lng: -121.8101,
      duration: 10,
      notes: 'Last fuel stop before entering park',
    },
    {
      type: 'food',
      name: 'Paradise Inn',
      address: 'Paradise, Mount Rainier',
      lat: 46.7866,
      lng: -121.7356,
      duration: 60,
      notes: 'Historic lodge with dining',
    },
    {
      type: 'attraction',
      name: 'Paradise Visitor Center',
      address: 'Paradise, Mount Rainier',
      lat: 46.7866,
      lng: -121.7356,
      duration: 45,
      notes: 'Visitor center and trailheads',
    },
  ],
};

export class ItineraryService {
  async generateItinerary(
    userId: string,
    destination: string,
    destLat: number,
    destLng: number,
    preferences: UserPreferences
  ): Promise<{ trip: any; itinerary: Itinerary }> {
    // Starting point (Seattle for MVP)
    const startLat = 47.6062;
    const startLng = -122.3321;

    // Calculate distance (simplified - in production use Google Distance Matrix API)
    const distance = this.calculateDistance(startLat, startLng, destLat, destLng);

    // Generate stops based on preferences
    const stops = this.generateStops(destination, distance, preferences);

    // Calculate total duration
    const drivingDuration = this.estimateDrivingDuration(distance, preferences);
    const stopsDuration = stops.reduce((sum, stop) => sum + stop.duration, 0);
    const totalDuration = drivingDuration + stopsDuration;

    // Calculate costs
    const costs = this.calculateCosts(distance, preferences, stops);

    const itinerary: Itinerary = {
      route: {
        startLat,
        startLng,
        endLat: destLat,
        endLng: destLng,
        waypoints: stops.map((s) => ({ lat: s.lat, lng: s.lng })),
      },
      stops,
      totalDistance: distance,
      totalDuration,
      estimatedCost: costs,
    };

    // Save trip to database
    const trip = await prisma.trip.create({
      data: {
        userId,
        destination,
        destinationLat: destLat,
        destinationLng: destLng,
        itineraryData: itinerary as any,
        estimatedCost: costs.total,
        distance,
        duration: totalDuration,
      },
    });

    return { trip, itinerary };
  }

  private generateStops(destination: string, distance: number, preferences: UserPreferences): Stop[] {
    const stops: Stop[] = [];

    // Add destination-specific stops
    if (STOPS_DATABASE[destination]) {
      stops.push(...STOPS_DATABASE[destination]);
    }

    // Add fuel/charging stops based on car type and distance
    if (preferences.hasCar) {
      if (preferences.carType === 'ev') {
        // EVs need charging roughly every 200 miles
        if (distance > 100) {
          stops.push({
            type: 'charging',
            name: 'Fast Charging Station',
            address: 'Midpoint of journey',
            lat: 47.5,
            lng: -122.0,
            duration: 45,
            notes: 'Plan for brunch/lunch while charging',
          });
        }
      } else if (preferences.carType === 'gas') {
        // Gas cars can go further, but add stop if > 150 miles
        if (distance > 150) {
          stops.push({
            type: 'fuel',
            name: 'Gas Station',
            address: 'Midpoint of journey',
            lat: 47.5,
            lng: -122.0,
            duration: 10,
            notes: 'Quick fuel stop',
          });
        }
      }
    }

    // Add food stops based on preferences
    if (preferences.foodPreference === 'pitstop_always') {
      const existingFoodStops = stops.filter((s) => s.type === 'food').length;
      if (existingFoodStops === 0) {
        stops.push({
          type: 'food',
          name: 'Local Restaurant',
          address: 'En route',
          lat: 47.5,
          lng: -122.0,
          duration: preferences.mealType === 'meal' ? 60 : 30,
          notes: preferences.mealType === 'meal' ? 'Sit-down meal' : 'Quick bite',
        });
      }
    }

    // Add scenic stops if high scenic preference
    if (preferences.scenicPreference >= 4) {
      stops.push({
        type: 'scenic',
        name: 'Scenic Viewpoint',
        address: 'Along the route',
        lat: 47.5,
        lng: -122.0,
        duration: 15,
        notes: 'Photo opportunity',
      });
    }

    return stops;
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    // Haversine formula for distance calculation
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private estimateDrivingDuration(distance: number, preferences: UserPreferences): number {
    // Base speed: 50 mph average
    let avgSpeed = 50;

    // Adjust for scenic preference (more scenic = slower, longer routes)
    if (preferences.scenicPreference >= 4) {
      avgSpeed = 40; // Slower scenic routes
    }

    return (distance / avgSpeed) * 60; // Convert to minutes
  }

  private calculateCosts(distance: number, preferences: UserPreferences, stops: Stop[]): {
    fuel: number;
    food: number;
    total: number;
  } {
    let fuelCost = 0;
    let foodCost = 0;

    // Fuel costs
    if (preferences.hasCar) {
      if (preferences.carType === 'ev') {
        // Average EV: 3.5 miles/kWh, $0.30/kWh
        fuelCost = (distance / 3.5) * 0.3;
      } else if (preferences.carType === 'gas') {
        // Average gas car: 30 mpg, $4.00/gallon
        fuelCost = (distance / 30) * 4.0;
      }
    }

    // Food costs
    const foodStops = stops.filter((s) => s.type === 'food');
    foodStops.forEach((stop) => {
      if (preferences.mealType === 'meal') {
        foodCost += 25; // Sit-down meal
      } else {
        foodCost += 12; // Quick bite
      }
    });

    return {
      fuel: Math.round(fuelCost * 100) / 100,
      food: Math.round(foodCost * 100) / 100,
      total: Math.round((fuelCost + foodCost) * 100) / 100,
    };
  }

  async getTrip(tripId: string, userId: string) {
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        OR: [
          { userId },
          {
            participants: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return trip;
  }

  async getUserTrips(userId: string) {
    return await prisma.trip.findMany({
      where: {
        OR: [
          { userId },
          {
            participants: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
