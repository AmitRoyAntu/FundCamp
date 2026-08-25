import express from 'express';
import { getProfile, getUserContributions, getUserCreatorAnalytics } from '../controllers/profileController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', verifyToken, getProfile);
router.get('/profile/contributions', verifyToken, getUserContributions);
router.get('/profile/analytics', verifyToken, getUserCreatorAnalytics);

export default router;
