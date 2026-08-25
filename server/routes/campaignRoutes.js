import express from 'express';
import { getAllCampaigns, getCampaignById, createCampaign } from '../controllers/campaignController.js';
import { getUpdatesByCampaign, createUpdate } from '../controllers/updateController.js';
import { getCommentsByCampaign, createComment } from '../controllers/commentController.js';
import { getDonationsByCampaign, createDonation } from '../controllers/donationController.js';
import { verifyToken, optionalVerifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/campaigns', getAllCampaigns);
router.get('/campaigns/:id', getCampaignById);
router.post('/campaigns', verifyToken, createCampaign);

// Campaign Updates routes
router.get('/campaigns/:id/updates', getUpdatesByCampaign);
router.post('/campaigns/:id/updates', verifyToken, createUpdate);

// Campaign Comments routes
router.get('/campaigns/:id/comments', getCommentsByCampaign);
router.post('/campaigns/:id/comments', verifyToken, createComment);

// Campaign Donations routes
router.get('/campaigns/:id/donations', getDonationsByCampaign);
router.post('/campaigns/:id/donate', optionalVerifyToken, createDonation);

export default router;

