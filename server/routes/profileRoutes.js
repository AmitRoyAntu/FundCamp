import express from 'express';
import { getProfile, updateProfile, getUserContributions, getUserCreatorAnalytics } from '../controllers/profileController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.get('/profile/contributions', verifyToken, getUserContributions);
router.get('/profile/analytics', verifyToken, getUserCreatorAnalytics);

export default router;
