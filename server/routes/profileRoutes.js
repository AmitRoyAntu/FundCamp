import express from 'express';
import {getProfile,
  updateProfile,
  getUserContributions,
  getUserCreatorAnalytics,
  saveCampaign,
  unsaveCampaign,
  checkSavedCampaign,
  getSavedCampaigns } from '../controllers/profileController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.get('/profile/contributions', verifyToken, getUserContributions);
router.get('/profile/analytics', verifyToken, getUserCreatorAnalytics);
router.get('/profile/saved-campaigns', verifyToken, getSavedCampaigns);

router.get('/profile/saved-campaigns/:campaignId', verifyToken, checkSavedCampaign);

router.post('/profile/saved-campaigns/:campaignId', verifyToken, saveCampaign);

router.delete('/profile/saved-campaigns/:campaignId', verifyToken, unsaveCampaign);
export default router;
