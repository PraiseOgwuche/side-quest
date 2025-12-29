import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types';
import { OnboardingService } from '../services/onboardingService';

const onboardingService = new OnboardingService();

const preferencesSchema = z.object({
  tripLength: z.enum(['short', 'long', 'day', 'weekend']),
  driverStatus: z.enum(['driver', 'passenger', 'both']),
  hasCar: z.boolean(),
  carType: z.enum(['ev', 'gas', 'hybrid']).optional(),
  foodPreference: z.enum(['pitstop_always', 'pitstop_sometimes', 'pitstop_never']),
  mealType: z.enum(['sandwich', 'meal', 'flexible']),
  eatLocation: z.enum(['stop', 'car', 'flexible']),
  scenicPreference: z.number().min(1).max(5),
  natureLover: z.boolean(),
  sightseeing: z.boolean(),
});

export class OnboardingController {
  async savePreferences(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const preferences = preferencesSchema.parse(req.body);
      const result = await onboardingService.savePreferences(req.userId, preferences);
      res.json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input', details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async getPreferences(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const preferences = await onboardingService.getPreferences(req.userId);
      if (!preferences) {
        return res.status(404).json({ error: 'Preferences not found' });
      }

      res.json(preferences);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
