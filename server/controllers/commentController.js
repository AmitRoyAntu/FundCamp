import { CampaignComment } from '../models/commentModel.js';
import { Campaign } from '../models/campaignModel.js';

export const getCommentsByCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await CampaignComment.findByCampaignId(id);
    return res.status(200).json({
      success: true,
      message: 'Campaign comments retrieved successfully',
      data: comments
    });
  } catch (error) {
    console.error('Get Campaign Comments Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const createComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: 'Comment content cannot be empty'
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

    const newComment = await CampaignComment.create({
      campaignId: id,
      userId,
      content: content.trim()
    });

    return res.status(201).json({
      success: true,
      message: 'Comment posted successfully',
      data: newComment
    });
  } catch (error) {
    console.error('Create Comment Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
