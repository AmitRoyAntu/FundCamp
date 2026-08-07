import apiClient from './apiClient';

const defaultImages = {
  Education: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200',
  Medical: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=1200',
  Research: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200',
  Scholarship: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200',
  Community: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1200',
  Environment: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=1200',
};

const formatCampaign = (c) => {
  if (!c) return null;
  const category = c.category || (c.title?.toLowerCase().includes('medical') ? 'Medical' : c.title?.toLowerCase().includes('research') ? 'Research' : 'Education');
  return {
    id: String(c.id),
    title: c.title,
    description: c.description,
    category,
    goalAmount: Number(c.goal_amount || c.goalAmount || 5000),
    amountRaised: Number(c.amount_raised || c.amountRaised || 0),
    creator: {
      name: c.creator_name || c.creator?.name || 'Campus Creator',
      userType: c.creator?.userType || 'Student',
      universityId: c.creator?.universityId || `STU-2026-${c.creator_id || '101'}`,
      avatar: c.creator?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300'
    },
    department: c.creator_department || c.department || 'University Department',
    createdAt: c.created_at ? new Date(c.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    status: c.status || 'active',
    image: c.image || defaultImages[category] || defaultImages.Education,
    story: c.description,
    objectives: c.objectives || [
      'Procure essential lab equipment and study material',
      'Coordinate student and faculty project leads',
      'Provide regular updates on fundraising progress'
    ]
  };
};

export const campaignService = {
  // GET /api/campaigns
  async getCampaigns(filters = {}) {
    const response = await apiClient.get('/campaigns');
    const rawList = response.data.data || [];
    let campaigns = rawList.map(formatCampaign);

    const { search, category, status, userType, sortBy } = filters;

    // Client-side search filtering
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      campaigns = campaigns.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.department.toLowerCase().includes(q) ||
          c.creator.name.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (category && category !== 'All') {
      campaigns = campaigns.filter((c) => c.category === category);
    }

    // Status filter
    if (status && status !== 'All') {
      if (status === 'active') campaigns = campaigns.filter((c) => c.status === 'active');
      if (status === 'completed') campaigns = campaigns.filter((c) => c.status === 'completed');
    }

    // User Type filter
    if (userType && userType !== 'All') {
      campaigns = campaigns.filter((c) => c.creator.userType === userType);
    }

    // Sorting
    if (sortBy) {
      if (sortBy === 'recent') {
        campaigns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sortBy === 'most_funded') {
        campaigns.sort((a, b) => b.amountRaised - a.amountRaised);
      } else if (sortBy === 'goal_high') {
        campaigns.sort((a, b) => b.goalAmount - a.goalAmount);
      } else if (sortBy === 'progress') {
        campaigns.sort((a, b) => (b.amountRaised / b.goalAmount) - (a.amountRaised / a.goalAmount));
      }
    }

    return campaigns;
  },

  // GET /api/campaigns/:id
  async getCampaignById(id) {
    const response = await apiClient.get(`/campaigns/${id}`);
    const campaign = response.data.data;
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    return formatCampaign(campaign);
  },

  // GET featured campaigns
  async getFeaturedCampaigns() {
    const campaigns = await this.getCampaigns();
    return campaigns.slice(0, 3);
  },

  // POST /api/campaigns
  async createCampaign(campaignData, user) {
    const payload = {
      title: campaignData.title,
      description: campaignData.description,
      goalAmount: Number(campaignData.goalAmount)
    };

    const response = await apiClient.post('/campaigns', payload);
    const created = response.data.data;

    return formatCampaign({
      ...created,
      category: campaignData.category,
      department: campaignData.department || user?.department,
      creator_name: user?.fullName || user?.name || 'Anonymous Creator',
      creator_department: user?.department || 'Campus Department'
    });
  },

  // GET user's campaigns
  async getUserCampaigns(user) {
    if (!user) return [];
    const campaigns = await this.getCampaigns();
    return campaigns.filter(
      (c) =>
        c.creator.name.toLowerCase() === (user.fullName || user.name || '').toLowerCase() ||
        String(c.creator.id) === String(user.id)
    );
  }
};

