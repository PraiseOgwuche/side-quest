import { Router } from 'express';
import { OnboardingController } from '../controllers/onboardingController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const onboardingController = new OnboardingController();

router.post('/preferences', authMiddleware, (req, res) =>
  onboardingController.savePreferences(req, res)
);

router.get('/preferences', authMiddleware, (req, res) =>
  onboardingController.getPreferences(req, res)
);

export default router;
