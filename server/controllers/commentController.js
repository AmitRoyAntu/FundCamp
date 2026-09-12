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

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    const userType = req.user.user_type || req.user.userType;

    // Fetch the comment first to check ownership
    const { query: dbQuery } = await import('../config/db.js');
    const commentResult = await dbQuery(
      'SELECT * FROM campaign_comments WHERE id = $1',
      [commentId]
    );
    const comment = commentResult.rows[0];

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
        error: `No comment found with id ${commentId}`,
      });
    }

    // Allow deletion by: Admin, comment author, or campaign creator
    const campaign = await Campaign.findById(comment.campaign_id);
    const isCampaignCreator = campaign && String(campaign.creator_id) === String(userId);
    const isCommentAuthor = String(comment.user_id) === String(userId);
    const isAdmin = userType === 'Admin';

    if (!isAdmin && !isCommentAuthor && !isCampaignCreator) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied',
        error: 'You do not have permission to delete this comment',
      });
    }

    const deleted = await CampaignComment.delete(commentId);
    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      data: deleted,
    });
  } catch (error) {
    console.error('Delete Comment Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

