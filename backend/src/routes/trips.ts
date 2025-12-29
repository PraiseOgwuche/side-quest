import { Router } from 'express';
import { TripController } from '../controllers/tripController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const tripController = new TripController();

router.get('/recommendations', authMiddleware, (req, res) =>
  tripController.getRecommendations(req, res)
);

router.post('/generate', authMiddleware, (req, res) =>
  tripController.generateTrip(req, res)
);

router.get('/', authMiddleware, (req, res) =>
  tripController.getUserTrips(req, res)
);

router.get('/:id', authMiddleware, (req, res) =>
  tripController.getTrip(req, res)
);

router.post('/:id/invite', authMiddleware, (req, res) =>
  tripController.inviteToTrip(req, res)
);

router.post('/:id/respond', authMiddleware, (req, res) =>
  tripController.respondToInvite(req, res)
);

export default router;
