import { Donation } from '../models/donationModel.js';

export const getDonationsByCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const donations = await Donation.findByCampaignId(id);
    return res.status(200).json({
      success: true,
      message: 'Top contributors retrieved successfully',
      data: donations
    });
  } catch (error) {
    console.error('Get Campaign Donations Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
