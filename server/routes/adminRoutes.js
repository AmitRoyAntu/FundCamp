import express from 'express';
import {
  getAdminStats,
  getAdminCampaigns,
  getAdminCampaignById,
  verifyCampaign,
  deleteCampaign,
  getAdminExpenses,
  verifyExpense,
} from '../controllers/adminController.js';
import { verifyAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Admin Stats & Platform Health
router.get('/admin/stats', verifyAdmin, getAdminStats);

// Admin Campaign Verification Queue & Moderation
router.get('/admin/campaigns', verifyAdmin, getAdminCampaigns);
router.get('/admin/campaigns/:id', verifyAdmin, getAdminCampaignById);
router.put('/admin/campaigns/:id/status', verifyAdmin, verifyCampaign);
router.delete('/admin/campaigns/:id', verifyAdmin, deleteCampaign);

// Admin Financial Transparency & Expense Receipts Audit
router.get('/admin/expenses', verifyAdmin, getAdminExpenses);
router.put('/admin/expenses/:id/status', verifyAdmin, verifyExpense);

export default router;
