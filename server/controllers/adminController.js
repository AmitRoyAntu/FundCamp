import { Campaign } from '../models/campaignModel.js';
import { Expense } from '../models/expenseModel.js';
import { User } from '../models/userModel.js';
import { Report } from '../models/reportModel.js';
import { query } from '../config/db.js';

export const getAdminStats = async (req, res) => {
  try {
    // Fetch campaigns, expenses, reports, and users for admin analytics
    const allCampaigns = await Campaign.findAllForAdmin({ status: 'all' });
    const allExpenses = await Expense.findAllForAdmin({ status: 'all' });
    const allReports = await Report.findAllForAdmin({ status: 'all' });
    const allUsers = await User.findAllForAdmin();

    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    let totalRaised = 0;
    let totalGoal = 0;

    const categoryDistribution = {};
    const departmentDistribution = {};

    allCampaigns.forEach((camp) => {
      const status = camp.status || 'pending';
      if (status === 'pending') pendingCount++;
      else if (status === 'approved') approvedCount++;
      else if (status === 'rejected') rejectedCount++;

      const raised = parseFloat(camp.amount_raised) || 0;
      const goal = parseFloat(camp.goal_amount) || 0;
      totalRaised += raised;
      totalGoal += goal;

      const cat = camp.category || 'Other';
      categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;

      const dept = camp.department || camp.creator_department || 'General';
      departmentDistribution[dept] = (departmentDistribution[dept] || 0) + 1;
    });

    let pendingExpensesCount = 0;
    let verifiedExpensesCount = 0;
    let totalExpensesAmount = 0;

    allExpenses.forEach((exp) => {
      if (exp.status === 'pending') pendingExpensesCount++;
      else if (exp.status === 'verified') {
        verifiedExpensesCount++;
        totalExpensesAmount += parseFloat(exp.amount) || 0;
      }
    });

    let pendingReportsCount = 0;
    let resolvedReportsCount = 0;
    let dismissedReportsCount = 0;

    allReports.forEach((rep) => {
      if (rep.status === 'pending') pendingReportsCount++;
      else if (rep.status === 'resolved') resolvedReportsCount++;
      else if (rep.status === 'dismissed') dismissedReportsCount++;
    });

    let activeUsersCount = 0;
    let deactivatedUsersCount = 0;

    allUsers.forEach((u) => {
      if (u.status === 'deactivated') deactivatedUsersCount++;
      else activeUsersCount++;
    });

    return res.status(200).json({
      success: true,
      message: 'Admin statistics retrieved successfully',
      data: {
        campaigns: {
          total: allCampaigns.length,
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          totalRaised,
          totalGoal,
        },
        expenses: {
          total: allExpenses.length,
          pending: pendingExpensesCount,
          verified: verifiedExpensesCount,
          totalVerifiedAmount: totalExpensesAmount,
        },
        reports: {
          total: allReports.length,
          pending: pendingReportsCount,
          resolved: resolvedReportsCount,
          dismissed: dismissedReportsCount,
        },
        users: {
          total: allUsers.length,
          active: activeUsersCount,
          deactivated: deactivatedUsersCount,
        },
        categoryDistribution,
        departmentDistribution,
      },
    });
  } catch (error) {
    console.error('Get Admin Stats Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching admin stats',
      error: error.message,
    });
  }
};

export const getAdminCampaigns = async (req, res) => {
  try {
    const { status, category, department, search } = req.query;
    const campaigns = await Campaign.findAllForAdmin({
      status: status || 'all',
      category,
      department,
      search,
    });

    // Parse documents if stored as string
    const formatted = campaigns.map((c) => {
      let docs = [];
      if (Array.isArray(c.documents)) {
        docs = c.documents;
      } else if (typeof c.documents === 'string') {
        try {
          docs = JSON.parse(c.documents);
        } catch {
          docs = [];
        }
      }
      return {
        ...c,
        documents: docs,
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Admin campaigns retrieved successfully',
      data: formatted,
    });
  } catch (error) {
    console.error('Get Admin Campaigns Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching admin campaigns',
      error: error.message,
    });
  }
};

export const getAdminCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
        error: `No campaign found with id ${id}`,
      });
    }

    let docs = [];
    if (Array.isArray(campaign.documents)) {
      docs = campaign.documents;
    } else if (typeof campaign.documents === 'string') {
      try {
        docs = JSON.parse(campaign.documents);
      } catch {
        docs = [];
      }
    }

    // Also fetch associated expenses and reports for transparency overview
    const expenses = await Expense.findAllForAdmin({ campaignId: id });
    const reports = await Report.findAllForAdmin({ status: 'all' });
    const campaignReports = reports.filter(r => String(r.campaign_id) === String(id));

    return res.status(200).json({
      success: true,
      message: 'Campaign retrieved successfully for verification',
      data: {
        ...campaign,
        documents: docs,
        expenses,
        reports: campaignReports,
      },
    });
  } catch (error) {
    console.error('Get Admin Campaign By ID Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching campaign details',
      error: error.message,
    });
  }
};

export const verifyCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, feedback, adminNotes } = req.body;
    const adminId = req.user.id;

    if (!action || !['approve', 'reject'].includes(action.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: "Action must be either 'approve' or 'reject'",
      });
    }

    const newStatus = action.toLowerCase() === 'approve' ? 'approved' : 'rejected';
    const finalFeedback = feedback || adminNotes || (newStatus === 'approved' ? 'Campaign verified by University Administration' : 'Campaign does not meet university funding guidelines');

    const updated = await Campaign.updateStatus(id, {
      status: newStatus,
      adminFeedback: finalFeedback,
      verifiedBy: adminId,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
        error: `No campaign found with id ${id}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Campaign ${newStatus === 'approved' ? 'approved and published' : 'rejected with feedback'} successfully`,
      data: updated,
    });
  } catch (error) {
    console.error('Verify Campaign Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while verifying campaign',
      error: error.message,
    });
  }
};

export const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Campaign.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
        error: `No campaign found with id ${id}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Campaign removed from university platform successfully',
      data: deleted,
    });
  } catch (error) {
    console.error('Delete Campaign Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while deleting campaign',
      error: error.message,
    });
  }
};

export const getAdminExpenses = async (req, res) => {
  try {
    const { status, campaignId } = req.query;
    const expenses = await Expense.findAllForAdmin({
      status: status || 'all',
      campaignId: campaignId ? parseInt(campaignId, 10) : undefined,
    });

    return res.status(200).json({
      success: true,
      message: 'Expense receipts retrieved successfully',
      data: expenses,
    });
  } catch (error) {
    console.error('Get Admin Expenses Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching expense receipts',
      error: error.message,
    });
  }
};

export const verifyExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!status || !['verified', 'rejected', 'pending'].includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: "Status must be 'verified', 'rejected', or 'pending'",
      });
    }

    const updated = await Expense.updateStatus(id, {
      status: status.toLowerCase(),
      adminNotes,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Expense receipt not found',
        error: `No expense receipt found with id ${id}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Expense receipt status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    console.error('Verify Expense Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating expense receipt',
      error: error.message,
    });
  }
};

// ==========================================
// USER MANAGEMENT (DEACTIVATE / REACTIVATE)
// ==========================================
export const getAdminUsers = async (req, res) => {
  try {
    const { search, department, status } = req.query;
    const users = await User.findAllForAdmin({ search, department, status });

    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
    });
  } catch (error) {
    console.error('Get Admin Users Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching users',
      error: error.message,
    });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'deactivated'].includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: "Status must be either 'active' or 'deactivated'",
      });
    }

    // Protection: Prevent admin from deactivating themselves
    if (String(id) === String(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Operation not permitted',
        error: 'You cannot deactivate your own administrator account',
      });
    }

    const updated = await User.updateStatus(id, status.toLowerCase());

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: `No user found with id ${id}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `User account has been ${status === 'active' ? 'reactivated' : 'deactivated'} successfully`,
      data: updated,
    });
  } catch (error) {
    console.error('Update User Status Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating user status',
      error: error.message,
    });
  }
};

// ==========================================
// FRAUD & POLICY REPORTS MANAGEMENT
// ==========================================
export const getAdminReports = async (req, res) => {
  try {
    const { status } = req.query;
    const reports = await Report.findAllForAdmin({ status: status || 'all' });

    return res.status(200).json({
      success: true,
      message: 'Campaign reports retrieved successfully',
      data: reports,
    });
  } catch (error) {
    console.error('Get Admin Reports Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching reports',
      error: error.message,
    });
  }
};

export const resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!status || !['pending', 'investigating', 'resolved', 'dismissed'].includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: "Status must be 'pending', 'investigating', 'resolved', or 'dismissed'",
      });
    }

    const updated = await Report.updateStatus(id, {
      status: status.toLowerCase(),
      adminNotes,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
        error: `No report found with id ${id}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Report status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    console.error('Resolve Report Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating report',
      error: error.message,
    });
  }
};
