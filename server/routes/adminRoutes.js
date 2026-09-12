import express from 'express';
import {
  getAdminStats,
  getAdminCampaigns,
  getAdminCampaignById,
  verifyCampaign,
  deleteCampaign,
  getAdminExpenses,
  verifyExpense,
  getAdminUsers,
  updateUserStatus,
  getAdminReports,
  resolveReport,
  getAdminComments,
  deleteAdminComment,
  getAdminUserDossier,
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

// Admin User Management (Deactivate / Reactivate Users)
router.get('/admin/users', verifyAdmin, getAdminUsers);
router.put('/admin/users/:id/status', verifyAdmin, updateUserStatus);

// Admin User Dossier (Full Profile Inspection)
router.get('/admin/users/:id/dossier', verifyAdmin, getAdminUserDossier);

// Admin Fraud & Moderation Reports Queue
router.get('/admin/reports', verifyAdmin, getAdminReports);
router.put('/admin/reports/:id/status', verifyAdmin, resolveReport);

// Admin Comment Moderation
router.get('/admin/comments', verifyAdmin, getAdminComments);
router.delete('/admin/comments/:id', verifyAdmin, deleteAdminComment);

export default router;
