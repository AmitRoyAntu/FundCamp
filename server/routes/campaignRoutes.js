import express from 'express';
import { getAllCampaigns, getCampaignById, createCampaign } from '../controllers/campaignController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/campaigns', getAllCampaigns);
router.get('/campaigns/:id', getCampaignById);
router.post('/campaigns', verifyToken, createCampaign);

export default router;
