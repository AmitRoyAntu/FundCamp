import { Expense } from '../models/expenseModel.js';
import { Campaign } from '../models/campaignModel.js';

export const getExpensesByCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userType = req.user?.user_type || req.user?.userType;

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
        error: `No campaign found with id ${id}`,
      });
    }

    const isCreator = userId && String(campaign.creator_id) === String(userId);
    const isAdmin = userType === 'Admin';

    // Creators and admins can see all expenses (including pending audit); public sees verified only
    const allCampaignExpenses = await Expense.findAllForAdmin({ campaignId: id });
    const visibleExpenses = (isCreator || isAdmin)
      ? allCampaignExpenses
      : allCampaignExpenses.filter((e) => e.status === 'verified');

    return res.status(200).json({
      success: true,
      message: 'Campaign expenses retrieved successfully',
      data: visibleExpenses,
    });
  } catch (error) {
    console.error('Get Campaign Expenses Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching expenses',
      error: error.message,
    });
  }
};

export const createCampaignExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, vendor, category, receiptUrl, receiptName } = req.body;
    const userId = req.user.id;
    const userType = req.user.user_type || req.user.userType;

    if (!title || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: 'Title and amount are required',
      });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: 'Amount must be a positive number',
      });
    }

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
        error: `No campaign found with id ${id}`,
      });
    }

    const isCreator = String(campaign.creator_id) === String(userId);
    const isAdmin = userType === 'Admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied',
        error: 'Only the campaign creator or an administrator can submit expense receipts',
      });
    }

    const newExpense = await Expense.create({
      campaignId: id,
      title: title.trim(),
      amount: numericAmount,
      vendor: vendor ? vendor.trim() : 'University Vendor',
      category: category || 'Equipment',
      receiptUrl: receiptUrl || null,
      receiptName: receiptName || null,
    });

    return res.status(201).json({
      success: true,
      message: 'Expense receipt submitted for administrative audit',
      data: newExpense,
    });
  } catch (error) {
    console.error('Create Campaign Expense Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while submitting expense',
      error: error.message,
    });
  }
};
