import { User } from '../models/userModel.js';
import { Campaign } from '../models/campaignModel.js';
import { Donation } from '../models/donationModel.js';
import { query } from '../config/db.js';

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'Profile does not exist'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        userType: user.user_type || user.userType,
        avatar: user.avatar,
        universityId: user.university_id || user.universityId,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, fullName, department, universityId, avatar } = req.body;

    const updatedUser = await User.update(userId, {
      name: fullName || name,
      department,
      universityId,
      avatar
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'Profile does not exist'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        department: updatedUser.department,
        userType: updatedUser.user_type || updatedUser.userType,
        avatar: updatedUser.avatar,
        universityId: updatedUser.university_id || updatedUser.universityId,
        createdAt: updatedUser.created_at
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const getUserContributions = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find donations by user_id or matching user name
    const sql = `
      SELECT d.*, c.title as campaign_title, c.category as campaign_category, c.image as campaign_image,
             c.goal_amount, c.amount_raised, c.created_at as campaign_created_at,
             u.name as creator_name, u.department as creator_department
      FROM donations d
      JOIN campaigns c ON d.campaign_id = c.id
      JOIN users u ON c.creator_id = u.id
      WHERE d.user_id = $1 OR d.donor_name ILIKE $2
      ORDER BY d.created_at DESC
    `;
    const result = await query(sql, [userId, user.name]);
    const contributions = result.rows || [];

    const totalContributed = contributions.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const uniqueCampaigns = new Set(contributions.map(item => item.campaign_id)).size;

    return res.status(200).json({
      success: true,
      message: 'User contributions retrieved successfully',
      data: {
        totalContributed,
        uniqueCampaignsCount: uniqueCampaigns,
        contributionsCount: contributions.length,
        contributions
      }
    });
  } catch (error) {
    console.error('Get User Contributions Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const getUserCreatorAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all campaigns created by this user
    const campaignsSql = `
      SELECT c.*,
             (SELECT COUNT(*) FROM donations WHERE campaign_id = c.id) as backer_count,
             (SELECT COUNT(*) FROM campaign_updates WHERE campaign_id = c.id) as update_count
      FROM campaigns c
      WHERE c.creator_id = $1
      ORDER BY c.created_at DESC
    `;
    const campaignsResult = await query(campaignsSql, [userId]);
    const campaigns = campaignsResult.rows || [];

    // Get all recent donations received across user's campaigns
    const donationsSql = `
      SELECT d.*, c.title as campaign_title, c.category as campaign_category
      FROM donations d
      JOIN campaigns c ON d.campaign_id = c.id
      WHERE c.creator_id = $1
      ORDER BY d.created_at DESC
      LIMIT 30
    `;
    const donationsResult = await query(donationsSql, [userId]);
    const recentDonations = donationsResult.rows || [];

    const totalRaised = campaigns.reduce((sum, c) => sum + parseFloat(c.amount_raised || 0), 0);
    const totalGoal = campaigns.reduce((sum, c) => sum + parseFloat(c.goal_amount || 0), 0);
    const totalBackers = campaigns.reduce((sum, c) => sum + parseInt(c.backer_count || 0, 10), 0);

    // Calculate funding timeline (last 7 / 30 days)
    const timelineMap = {};
    recentDonations.forEach(d => {
      const dateKey = new Date(d.created_at).toISOString().split('T')[0];
      timelineMap[dateKey] = (timelineMap[dateKey] || 0) + parseFloat(d.amount || 0);
    });

    const fundingTimeline = Object.entries(timelineMap).map(([date, amount]) => ({
      date,
      amount
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    return res.status(200).json({
      success: true,
      message: 'Creator analytics retrieved successfully',
      data: {
        totalRaised,
        totalGoal,
        totalBackers,
        campaignsCount: campaigns.length,
        campaigns,
        recentDonations,
        fundingTimeline
      }
    });
  } catch (error) {
    console.error('Get Creator Analytics Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
