import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types';
import { RecommendationService } from '../services/recommendationService';
import { ItineraryService } from '../services/itineraryService';
import { OnboardingService } from '../services/onboardingService';
import prisma from '../lib/prisma';

const recommendationService = new RecommendationService();
const itineraryService = new ItineraryService();
const onboardingService = new OnboardingService();

const generateTripSchema = z.object({
  destination: z.string(),
  destinationLat: z.number(),
  destinationLng: z.number(),
});

const inviteSchema = z.object({
  email: z.string().email(),
});

export class TripController {
  async getRecommendations(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get user preferences
      const preferences = await onboardingService.getPreferences(req.userId);
      if (!preferences) {
        return res.status(400).json({ error: 'Please complete onboarding first' });
      }

      // Get recommendations
      const recommendations = await recommendationService.getRecommendations(preferences);
      res.json(recommendations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async generateTrip(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const data = generateTripSchema.parse(req.body);

      // Get user preferences
      const preferences = await onboardingService.getPreferences(req.userId);
      if (!preferences) {
        return res.status(400).json({ error: 'Please complete onboarding first' });
      }

      // Generate itinerary
      const result = await itineraryService.generateItinerary(
        req.userId,
        data.destination,
        data.destinationLat,
        data.destinationLng,
        preferences
      );

      res.json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input', details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async getTrip(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const trip = await itineraryService.getTrip(req.params.id, req.userId);
      if (!trip) {
        return res.status(404).json({ error: 'Trip not found' });
      }

      res.json(trip);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUserTrips(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const trips = await itineraryService.getUserTrips(req.userId);
      res.json(trips);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async inviteToTrip(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const tripId = req.params.id;
      const data = inviteSchema.parse(req.body);

      // Verify user owns the trip
      const trip = await prisma.trip.findFirst({
        where: { id: tripId, userId: req.userId },
      });

      if (!trip) {
        return res.status(404).json({ error: 'Trip not found or unauthorized' });
      }

      // Find user to invite
      const invitedUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!invitedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if already invited
      const existing = await prisma.tripParticipant.findUnique({
        where: {
          tripId_userId: {
            tripId,
            userId: invitedUser.id,
          },
        },
      });

      if (existing) {
        return res.status(400).json({ error: 'User already invited' });
      }

      // Create invitation
      const participant = await prisma.tripParticipant.create({
        data: {
          tripId,
          userId: invitedUser.id,
          status: 'invited',
        },
      });

      res.json(participant);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input', details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async respondToInvite(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id: tripId } = req.params;
      const { status } = req.body;

      if (!['accepted', 'declined'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const participant = await prisma.tripParticipant.findFirst({
        where: {
          tripId,
          userId: req.userId,
        },
      });

      if (!participant) {
        return res.status(404).json({ error: 'Invitation not found' });
      }

      const updated = await prisma.tripParticipant.update({
        where: { id: participant.id },
        data: { status },
      });

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
