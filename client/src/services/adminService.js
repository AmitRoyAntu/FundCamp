import apiClient from './apiClient';

export const adminService = {
  // GET /api/admin/stats
  async getStats() {
    const response = await apiClient.get('/admin/stats');
    return response.data.data;
  },

  // GET /api/admin/campaigns
  async getCampaigns(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.department && filters.department !== 'All') params.append('department', filters.department);
    if (filters.search && filters.search.trim()) params.append('search', filters.search.trim());

    const url = `/admin/campaigns${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data.data;
  },

  // GET /api/admin/campaigns/:id
  async getCampaignById(id) {
    const response = await apiClient.get(`/admin/campaigns/${id}`);
    return response.data.data;
  },

  // PUT /api/admin/campaigns/:id/status
  async verifyCampaign(id, { action, feedback, adminNotes }) {
    const response = await apiClient.put(`/admin/campaigns/${id}/status`, {
      action,
      feedback,
      adminNotes,
    });
    return response.data.data;
  },

  // DELETE /api/admin/campaigns/:id
  async deleteCampaign(id) {
    const response = await apiClient.delete(`/admin/campaigns/${id}`);
    return response.data.data;
  },

  // GET /api/admin/expenses
  async getExpenses(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.campaignId) params.append('campaignId', filters.campaignId);

    const url = `/admin/expenses${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data.data;
  },

  // PUT /api/admin/expenses/:id/status
  async verifyExpense(id, { status, adminNotes }) {
    const response = await apiClient.put(`/admin/expenses/${id}/status`, {
      status,
      adminNotes,
    });
    return response.data.data;
  },

  // GET /api/admin/users
  async getUsers(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.department && filters.department !== 'All') params.append('department', filters.department);
    if (filters.search && filters.search.trim()) params.append('search', filters.search.trim());

    const url = `/admin/users${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data.data;
  },

  // PUT /api/admin/users/:id/status
  async updateUserStatus(id, status) {
    const response = await apiClient.put(`/admin/users/${id}/status`, { status });
    return response.data.data;
  },

  // GET /api/admin/reports
  async getReports(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);

    const url = `/admin/reports${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data.data;
  },

  // PUT /api/admin/reports/:id/status
  async resolveReport(id, { status, adminNotes }) {
    const response = await apiClient.put(`/admin/reports/${id}/status`, {
      status,
      adminNotes,
    });
    return response.data.data;
  },

  // GET /api/admin/comments
  async getComments(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search && filters.search.trim()) params.append('search', filters.search.trim());
    if (filters.campaignId) params.append('campaignId', filters.campaignId);
    if (filters.userId) params.append('userId', filters.userId);

    const url = `/admin/comments${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data.data;
  },

  // DELETE /api/admin/comments/:id
  async deleteComment(commentId) {
    const response = await apiClient.delete(`/admin/comments/${commentId}`);
    return response.data.data;
  },

  // GET /api/admin/users/:id/dossier
  async getUserDossier(userId) {
    const response = await apiClient.get(`/admin/users/${userId}/dossier`);
    return response.data.data;
  },
};
