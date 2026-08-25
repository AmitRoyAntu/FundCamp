import { CampaignUpdate } from '../models/updateModel.js';
import { Campaign } from '../models/campaignModel.js';

export const getUpdatesByCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = await CampaignUpdate.findByCampaignId(id);
    return res.status(200).json({
      success: true,
      message: 'Campaign updates retrieved successfully',
      data: updates
    });
  } catch (error) {
    console.error('Get Campaign Updates Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const createUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, image, pdfUrl, pdfName } = req.body;
    const userId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: 'Title and content are required for update'
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

    // Check if the requesting user is the creator of the campaign
    if (campaign.creator_id && String(campaign.creator_id) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        error: 'Only the campaign creator can post updates'
      });
    }

    const newUpdate = await CampaignUpdate.create({
      campaignId: id,
      title,
      content,
      image,
      pdfUrl,
      pdfName
    });

    return res.status(201).json({
      success: true,
      message: 'Update posted successfully',
      data: newUpdate
    });
  } catch (error) {
    console.error('Create Update Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
