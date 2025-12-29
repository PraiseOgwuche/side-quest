import prisma from '../lib/prisma';
import { UserPreferences } from '../types';

export class OnboardingService {
  async savePreferences(userId: string, preferences: UserPreferences) {
    // Check if preferences already exist
    const existing = await prisma.userPreference.findUnique({
      where: { userId },
    });

    if (existing) {
      // Update existing preferences
      return await prisma.userPreference.update({
        where: { userId },
        data: {
          tripLength: preferences.tripLength,
          driverStatus: preferences.driverStatus,
          hasCar: preferences.hasCar,
          carType: preferences.carType,
          foodPreference: preferences.foodPreference,
          mealType: preferences.mealType,
          eatLocation: preferences.eatLocation,
          scenicPreference: preferences.scenicPreference,
          natureLover: preferences.natureLover,
          sightseeing: preferences.sightseeing,
        },
      });
    }

    // Create new preferences
    return await prisma.userPreference.create({
      data: {
        userId,
        tripLength: preferences.tripLength,
        driverStatus: preferences.driverStatus,
        hasCar: preferences.hasCar,
        carType: preferences.carType,
        foodPreference: preferences.foodPreference,
        mealType: preferences.mealType,
        eatLocation: preferences.eatLocation,
        scenicPreference: preferences.scenicPreference,
        natureLover: preferences.natureLover,
        sightseeing: preferences.sightseeing,
      },
    });
  }

  async getPreferences(userId: string) {
    return await prisma.userPreference.findUnique({
      where: { userId },
    });
  }
}
