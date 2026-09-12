import express from 'express';
import { getAllCampaigns, getCampaignById, createCampaign, processDonation, reportCampaign } from '../controllers/campaignController.js';
import { getUpdatesByCampaign, createUpdate } from '../controllers/updateController.js';
import { getCommentsByCampaign, createComment, deleteComment } from '../controllers/commentController.js';
import { getDonationsByCampaign } from '../controllers/donationController.js';
import { verifyToken, optionalVerifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Campaign Core routes
router.get('/campaigns', getAllCampaigns);
router.get('/campaigns/:id', getCampaignById);
router.post('/campaigns', verifyToken, createCampaign);

// Campaign Report route (Fraud & policy violations)
router.post('/campaigns/:id/report', optionalVerifyToken, reportCampaign);

// Campaign Donations routes
router.get('/campaigns/:id/donations', getDonationsByCampaign);
router.post('/campaigns/:id/donate', optionalVerifyToken, processDonation);

// Campaign Updates routes
router.get('/campaigns/:id/updates', getUpdatesByCampaign);
router.post('/campaigns/:id/updates', verifyToken, createUpdate);

// Campaign Comments routes
router.get('/campaigns/:id/comments', getCommentsByCampaign);
router.post('/campaigns/:id/comments', verifyToken, createComment);
router.delete('/campaigns/:id/comments/:commentId', verifyToken, deleteComment);

export default router;
