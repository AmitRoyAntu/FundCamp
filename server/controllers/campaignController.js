import { Campaign } from '../models/campaignModel.js';

export const getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.findAll();
    return res.status(200).json({
      success: true,
      message: 'Campaigns retrieved successfully',
      data: campaigns
    });
  } catch (error) {
    console.error('Get All Campaigns Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
        error: `No campaign found with id ${id}`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Campaign retrieved successfully',
      data: campaign
    });
  } catch (error) {
    console.error('Get Campaign By ID Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const createCampaign = async (req, res) => {
  try {
    const { title, description, category, department, image, goalAmount, tags } = req.body;
    const creatorId = req.user.id;

    if (!title || !description || goalAmount === undefined || goalAmount === null) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: 'Title, description, and goalAmount are required'
      });
    }

    const numericGoal = parseFloat(goalAmount);
    if (isNaN(numericGoal) || numericGoal <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: 'Goal Amount must be greater than zero'
      });
    }

    const newCampaign = await Campaign.create({
      title,
      description,
      category,
      department,
      image,
      goalAmount: numericGoal,
      tags,
      creatorId
    });

    return res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: newCampaign
    });
  } catch (error) {
    console.error('Create Campaign Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const processDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, donorName, paymentMethod } = req.body;
    const userId = req.user?.id || null;

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: 'Donation amount must be greater than zero'
      });
    }

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
        error: `No campaign found with id ${id}`
      });
    }

    // Rule: Creators cannot donate to their own campaigns
    if (userId && String(campaign.creator_id) === String(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Forbidden: Creators cannot donate to their own campaign',
        error: 'You cannot donate to your own campaign'
      });
    }

    const updatedCampaign = await Campaign.donate({
      id,
      userId,
      amount: numericAmount,
      donorName: donorName || req.user?.name || 'Anonymous Backer',
      paymentMethod
    });

    return res.status(200).json({
      success: true,
      message: 'Donation processed successfully',
      data: updatedCampaign || campaign
    });
  } catch (error) {
    console.error('Process Donation Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
