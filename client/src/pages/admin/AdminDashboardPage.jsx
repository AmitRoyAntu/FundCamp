import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import DocumentVerificationModal from '../../components/admin/DocumentVerificationModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CAMPAIGN_CATEGORIES } from '../../constants/categories';
import { DEPARTMENTS } from '../../constants/userTypes';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Coins,
  Receipt,
  FileText,
  Search,
  Filter,
  Eye,
  Trash2,
  RefreshCw,
  Tag,
  Building2,
  User,
  GraduationCap,
  ExternalLink,
  AlertCircle,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Layers,
  ShieldAlert,
  Flag,
  UserX,
  UserCheck,
  Users,
  AlertTriangle,
  FileWarning,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { currentUser } = useAuth();

  // Main Tab State: 'queue' | 'reports' | 'users' | 'expenses' | 'analytics'
  const [activeTab, setActiveTab] = useState('queue');

  // Loading States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionProcessing, setActionProcessing] = useState(false);

  // Data States
  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);

  // Queue Filter States
  const [statusFilter, setStatusFilter] = useState('pending'); // 'pending' | 'approved' | 'rejected' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  // Reports Filter States
  const [reportStatusFilter, setReportStatusFilter] = useState('pending'); // 'pending' | 'resolved' | 'dismissed' | 'all'

  // Users Filter States
  const [userStatusFilter, setUserStatusFilter] = useState('all'); // 'all' | 'active' | 'deactivated'
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userDeptFilter, setUserDeptFilter] = useState('All');

  // Expense Filter States
  const [expenseStatusFilter, setExpenseStatusFilter] = useState('all');

  // Selected Campaign for Document Modal
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsData, campaignsData, expensesData, reportsData, usersData] = await Promise.all([
        adminService.getStats(),
        adminService.getCampaigns({ status: 'all' }),
        adminService.getExpenses({ status: 'all' }),
        adminService.getReports({ status: 'all' }),
        adminService.getUsers({ status: 'all' }),
      ]);
      setStats(statsData);
      setCampaigns(campaignsData);
      setExpenses(expensesData);
      setReports(reportsData);
      setUsers(usersData);
    } catch (err) {
      toast.error(err.message || 'Failed to load administrative data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const [statsData, campaignsData, expensesData, reportsData, usersData] = await Promise.all([
        adminService.getStats(),
        adminService.getCampaigns({ status: 'all' }),
        adminService.getExpenses({ status: 'all' }),
        adminService.getReports({ status: 'all' }),
        adminService.getUsers({ status: 'all' }),
      ]);
      setStats(statsData);
      setCampaigns(campaignsData);
      setExpenses(expensesData);
      setReports(reportsData);
      setUsers(usersData);
      toast.success('Admin data refreshed successfully');
    } catch (err) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  // Open Document Review Modal
  const handleOpenReview = (campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  // Handle Campaign Approve
  const handleApproveCampaign = async (id, feedback) => {
    setActionProcessing(true);
    try {
      await adminService.verifyCampaign(id, { action: 'approve', feedback });
      toast.success('Campaign verified and published successfully!', { icon: '🎉' });
      setIsModalOpen(false);
      await loadAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to approve campaign');
    } finally {
      setActionProcessing(false);
    }
  };

  // Handle Campaign Reject
  const handleRejectCampaign = async (id, feedback) => {
    setActionProcessing(true);
    try {
      await adminService.verifyCampaign(id, { action: 'reject', feedback });
      toast.success('Campaign rejected. Feedback recorded for creator.', { icon: '⚠️' });
      setIsModalOpen(false);
      await loadAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to reject campaign');
    } finally {
      setActionProcessing(false);
    }
  };

  // Handle Delete / Take Down Campaign
  const handleDeleteCampaign = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently remove the campaign "${title}" from the platform? This will also remove any public listings.`)) {
      return;
    }
    setActionProcessing(true);
    try {
      await adminService.deleteCampaign(id);
      toast.success('Campaign taken down successfully', { icon: '🗑️' });
      if (isModalOpen) setIsModalOpen(false);
      await loadAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to remove campaign');
    } finally {
      setActionProcessing(false);
    }
  };

  // Handle Expense Status Update
  const handleUpdateExpenseStatus = async (id, status, notes) => {
    setActionProcessing(true);
    try {
      await adminService.verifyExpense(id, { status, adminNotes: notes });
      toast.success(`Expense receipt marked as ${status}`);
      await loadAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to update expense status');
    } finally {
      setActionProcessing(false);
    }
  };

  // Handle User Deactivation / Reactivation
  const handleToggleUserStatus = async (userId, userName, currentStatus) => {
    const isCurrentlyActive = (currentStatus || 'active') === 'active';
    const newStatus = isCurrentlyActive ? 'deactivated' : 'active';
    const actionText = isCurrentlyActive ? 'deactivate' : 'reactivate';

    if (!window.confirm(`Are you sure you want to ${actionText} user account "${userName}"? ${isCurrentlyActive ? 'They will be barred from logging in or publishing campaigns.' : 'Their account access will be restored.'}`)) {
      return;
    }

    setActionProcessing(true);
    try {
      await adminService.updateUserStatus(userId, newStatus);
      toast.success(`User ${userName} has been ${newStatus === 'active' ? 'reactivated' : 'deactivated'}`, {
        icon: newStatus === 'active' ? '✅' : '🚫',
      });
      await loadAllData();
    } catch (err) {
      toast.error(err.message || `Failed to ${actionText} user`);
    } finally {
      setActionProcessing(false);
    }
  };

  // Handle Fraud Report Resolution
  const handleResolveReport = async (reportId, status) => {
    const defaultNote = status === 'resolved' 
      ? 'Investigation complete. Corrective administrative action taken.' 
      : 'Report reviewed and dismissed. No violation detected.';
    const adminNotes = window.prompt(`Enter administrative investigation findings for this report:`, defaultNote);
    if (adminNotes === null) return;

    setActionProcessing(true);
    try {
      await adminService.resolveReport(reportId, { status, adminNotes });
      toast.success(`Report status updated to ${status}`);
      await loadAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to update report status');
    } finally {
      setActionProcessing(false);
    }
  };

  // Handle Take Down Campaign directly from Report
  const handleTakeDownFromReport = async (campaignId, campaignTitle, reportId) => {
    if (!window.confirm(`Take down fraudulent campaign "${campaignTitle}" and mark this report resolved?`)) {
      return;
    }

    setActionProcessing(true);
    try {
      await adminService.deleteCampaign(campaignId);
      await adminService.resolveReport(reportId, {
        status: 'resolved',
        adminNotes: 'Campaign taken down from platform following verified fraud report.',
      });
      toast.success('Campaign removed and report resolved!', { icon: '🛡️' });
      await loadAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to take down campaign from report');
    } finally {
      setActionProcessing(false);
    }
  };

  // Handle Deactivate Creator directly from Report
  const handleDeactivateCreatorFromReport = async (creatorId, creatorName, reportId) => {
    if (!window.confirm(`Deactivate creator account "${creatorName}" for policy violation?`)) {
      return;
    }

    setActionProcessing(true);
    try {
      await adminService.updateUserStatus(creatorId, 'deactivated');
      toast.success(`Account for ${creatorName} deactivated`, { icon: '🚫' });
      await loadAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to deactivate creator');
    } finally {
      setActionProcessing(false);
    }
  };

  // Filtered Campaigns for Queue Tab
  const filteredCampaigns = campaigns.filter((c) => {
    const statusMatch = statusFilter === 'all' || (c.status || 'pending') === statusFilter;
    const categoryMatch = selectedCategory === 'All' || c.category === selectedCategory;
    const deptMatch =
      selectedDepartment === 'All' ||
      c.department === selectedDepartment ||
      c.creator_department === selectedDepartment;
    const query = searchQuery.toLowerCase().trim();
    const searchMatch =
      !query ||
      c.title.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query) ||
      c.creator_name?.toLowerCase().includes(query);

    return statusMatch && categoryMatch && deptMatch && searchMatch;
  });

  // Filtered Reports
  const filteredReports = reports.filter((r) => {
    if (reportStatusFilter === 'all') return true;
    return (r.status || 'pending') === reportStatusFilter;
  });

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const statusMatch = userStatusFilter === 'all' || (u.status || 'active') === userStatusFilter;
    const deptMatch = userDeptFilter === 'All' || u.department === userDeptFilter;
    const query = userSearchQuery.toLowerCase().trim();
    const searchMatch =
      !query ||
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.university_id && u.university_id.toLowerCase().includes(query));

    return statusMatch && deptMatch && searchMatch;
  });

  // Filtered Expenses
  const filteredExpenses = expenses.filter((e) => {
    if (expenseStatusFilter === 'all') return true;
    return e.status === expenseStatusFilter;
  });

  // Count helper metrics
  const pendingCampaignsCount = campaigns.filter((c) => (c.status || 'pending') === 'pending').length;
  const approvedCampaignsCount = campaigns.filter((c) => c.status === 'approved').length;
  const rejectedCampaignsCount = campaigns.filter((c) => c.status === 'rejected').length;

  const pendingReportsCount = reports.filter((r) => (r.status || 'pending') === 'pending').length;
  const resolvedReportsCount = reports.filter((r) => r.status === 'resolved').length;
  const dismissedReportsCount = reports.filter((r) => r.status === 'dismissed').length;

  const deactivatedUsersCount = users.filter((u) => u.status === 'deactivated').length;
  const activeUsersCount = users.filter((u) => (u.status || 'active') === 'active').length;

  const pendingExpensesCount = expenses.filter((e) => e.status === 'pending').length;

  if (loading) {
    return <Loader text="Loading University Administration Hub..." />;
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <PageHeader
        title="University Verification & Moderation Hub"
        description="Official administration gateway to verify campaigns, manage user accounts, resolve fraud reports, and audit financial transparency."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          isLoading={refreshing}
          icon={RefreshCw}
        >
          Refresh Data
        </Button>
      </PageHeader>

      {/* Top KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Pending Campaigns Queue */}
        <Card className="p-5 border-l-4 border-l-amber-500 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Verification Queue
              </p>
              <h3 className="text-3xl font-extrabold text-gray-900 mt-1">
                {stats?.campaigns?.pending ?? pendingCampaignsCount}
              </h3>
              <p className="text-xs text-amber-600 font-semibold mt-1">
                Campaigns Awaiting Clearance
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Metric 2: Fraud & Moderation Reports */}
        <Card className={`p-5 border-l-4 ${pendingReportsCount > 0 ? 'border-l-red-500' : 'border-l-gray-300'} bg-white shadow-xs`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Fraud & Policy Reports
              </p>
              <h3 className={`text-3xl font-extrabold ${pendingReportsCount > 0 ? 'text-red-600' : 'text-gray-900'} mt-1`}>
                {stats?.reports?.pending ?? pendingReportsCount}
              </h3>
              <p className="text-xs text-red-600 font-semibold mt-1">
                {pendingReportsCount > 0 ? 'Urgent Investigation Needed' : 'No Pending Complaints'}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${pendingReportsCount > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'} flex items-center justify-center`}>
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Metric 3: Campus User Accounts */}
        <Card className="p-5 border-l-4 border-l-[#007979] bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Campus Accounts
              </p>
              <h3 className="text-3xl font-extrabold text-[#007979] mt-1">
                {users.length}
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-1">
                {activeUsersCount} Active • <span className={deactivatedUsersCount > 0 ? 'text-red-600 font-bold' : ''}>{deactivatedUsersCount} Suspended</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#007979]/10 text-[#007979] flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Metric 4: Total Funds Raised */}
        <Card className="p-5 border-l-4 border-l-[#E37434] bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Total Raised Volume
              </p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-1">
                {formatCurrency(stats?.campaigns?.totalRaised ?? 0)}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Verified Backer Volume
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#E37434]/10 text-[#E37434] flex items-center justify-center">
              <Coins className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold border-b-2 transition-colors shrink-0 cursor-pointer ${
            activeTab === 'queue'
              ? 'border-[#007979] text-[#007979]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ShieldCheck className="w-4.5 h-4.5" />
          <span>Verification Queue</span>
          {pendingCampaignsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800">
              {pendingCampaignsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold border-b-2 transition-colors shrink-0 cursor-pointer ${
            activeTab === 'reports'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ShieldAlert className="w-4.5 h-4.5" />
          <span>Fraud & Moderation Reports</span>
          {pendingReportsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-red-100 text-red-800 animate-pulse">
              {pendingReportsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold border-b-2 transition-colors shrink-0 cursor-pointer ${
            activeTab === 'users'
              ? 'border-[#007979] text-[#007979]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Users className="w-4.5 h-4.5" />
          <span>User Accounts</span>
          {deactivatedUsersCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-red-600">
              {deactivatedUsersCount} Suspended
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold border-b-2 transition-colors shrink-0 cursor-pointer ${
            activeTab === 'expenses'
              ? 'border-[#007979] text-[#007979]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Receipt className="w-4.5 h-4.5" />
          <span>Expense Receipts</span>
          {pendingExpensesCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800">
              {pendingExpensesCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold border-b-2 transition-colors shrink-0 cursor-pointer ${
            activeTab === 'analytics'
              ? 'border-[#007979] text-[#007979]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <BarChart3 className="w-4.5 h-4.5" />
          <span>Platform Overview & Removal</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DOCUMENT-VERIFICATION QUEUE */}
      {/* ========================================================================= */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          {/* Status Sub-filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'pending'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Needs Review ({pendingCampaignsCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('approved')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'approved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Approved ({approvedCampaignsCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('rejected')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'rejected'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Rejected ({rejectedCampaignsCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-[#007979] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Campaigns ({campaigns.length})
              </button>
            </div>

            <div className="text-xs text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-900">{filteredCampaigns.length}</span> campaigns
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <div className="md:col-span-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search title, creator, story..."
              />
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#24B1B1]"
              >
                <option value="All">All Categories</option>
                {CAMPAIGN_CATEGORIES.map((cat) => (
                  <option key={cat.id || cat} value={cat.id || cat}>
                    {cat.label || cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#24B1B1]"
              >
                <option value="All">All Departments</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Verification Cards */}
          {filteredCampaigns.length === 0 ? (
            <EmptyState
              title="No campaigns match current filter"
              description="There are currently no campaigns matching the selected status or search parameters."
              actionLabel="Reset Queue Filters"
              onAction={() => {
                setStatusFilter('pending');
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedDepartment('All');
              }}
            />
          ) : (
            <div className="space-y-3">
              {filteredCampaigns.map((camp) => {
                const docs = Array.isArray(camp.documents) ? camp.documents : [];
                const status = camp.status || 'pending';

                return (
                  <Card
                    key={camp.id}
                    className="p-5 hover:shadow-md transition-shadow border border-gray-200"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Thumbnail & Core Info */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                          <img
                            src={camp.image || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=300'}
                            alt={camp.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#007979]/10 text-[#007979]">
                              {camp.category || 'Education'}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                                status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {status === 'approved'
                                ? '✓ Approved'
                                : status === 'rejected'
                                ? '✕ Rejected'
                                : '⏳ Pending Review'}
                            </span>
                            {docs.length > 0 && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                <FileText className="w-3.5 h-3.5" />
                                {docs.length} Doc{docs.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>

                          <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug truncate">
                            {camp.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                            <span className="inline-flex items-center gap-1 font-semibold text-gray-900">
                              <User className="w-3.5 h-3.5 text-[#007979]" />
                              {camp.creator_name} ({camp.creator_user_type || 'Student'})
                            </span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 text-gray-600">
                              <Building2 className="w-3.5 h-3.5 text-gray-400" />
                              {camp.creator_department || camp.department}
                            </span>
                            <span>•</span>
                            <span className="font-bold text-[#E37434]">
                              Goal: {formatCurrency(camp.goal_amount)}
                            </span>
                            <span>•</span>
                            <span className="text-gray-400">
                              Submitted: {formatDate(camp.created_at)}
                            </span>
                          </div>

                          {camp.admin_feedback && (
                            <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100 italic">
                              <span className="font-bold not-italic text-gray-700">Admin Note: </span>
                              {camp.admin_feedback}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenReview(camp)}
                          icon={Eye}
                        >
                          Review & Verify
                        </Button>

                        {status === 'pending' && (
                          <>
                            <button
                              type="button"
                              title="Quick Approve"
                              onClick={() => handleApproveCampaign(camp.id, 'Quick approval by university administrator.')}
                              className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              title="Reject"
                              onClick={() => handleOpenReview(camp)}
                              className="w-9 h-9 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          title="Remove Campaign from Platform"
                          onClick={() => handleDeleteCampaign(camp.id, camp.title)}
                          className="w-9 h-9 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FRAUD & MODERATION REPORTS */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Sub-filters for Reports */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setReportStatusFilter('pending')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reportStatusFilter === 'pending'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Needs Review ({pendingReportsCount})
              </button>
              <button
                type="button"
                onClick={() => setReportStatusFilter('resolved')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reportStatusFilter === 'resolved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Resolved ({resolvedReportsCount})
              </button>
              <button
                type="button"
                onClick={() => setReportStatusFilter('dismissed')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reportStatusFilter === 'dismissed'
                    ? 'bg-gray-700 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Dismissed ({dismissedReportsCount})
              </button>
              <button
                type="button"
                onClick={() => setReportStatusFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reportStatusFilter === 'all'
                    ? 'bg-[#007979] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Reports ({reports.length})
              </button>
            </div>

            <p className="text-xs text-gray-500 font-medium">
              Reports filed by university students, faculty, or verified campus backers.
            </p>
          </div>

          {/* Reports List */}
          {filteredReports.length === 0 ? (
            <EmptyState
              title="No reports in this category"
              description="There are currently no campaign integrity or fraud reports with the selected status filter."
              actionLabel="Show All Reports"
              onAction={() => setReportStatusFilter('all')}
            />
          ) : (
            <div className="space-y-4">
              {filteredReports.map((rep) => {
                const isPending = (rep.status || 'pending') === 'pending';
                const isResolved = rep.status === 'resolved';
                const creatorDeactivated = rep.creator_status === 'deactivated';

                return (
                  <Card key={rep.id} className="p-5 border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="space-y-4">
                      {/* Top Meta Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            {rep.reason}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              isResolved
                                ? 'bg-emerald-100 text-emerald-800'
                                : rep.status === 'dismissed'
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {isResolved ? '✓ Resolved' : rep.status === 'dismissed' ? '✕ Dismissed' : '⏳ Action Required'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          Reported on {formatDate(rep.created_at)}
                        </span>
                      </div>

                      {/* Reported Campaign & Creator Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                        {/* Left: Campaign Information */}
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Reported Campaign
                          </p>
                          <h4 className="text-sm font-bold text-gray-900 leading-snug">
                            {rep.campaign_title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="font-semibold text-[#007979]">{rep.campaign_category}</span>
                            <span>•</span>
                            <span>Status: {rep.campaign_status}</span>
                          </div>
                        </div>

                        {/* Right: Creator Information & Account Status */}
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Campaign Creator
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">{rep.creator_name}</span>
                            <span
                              className={`px-2 py-0.2 rounded-full text-[10px] font-bold uppercase ${
                                creatorDeactivated
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {creatorDeactivated ? 'Account Deactivated' : 'Active Account'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {rep.creator_department} • {rep.creator_email}
                          </p>
                        </div>
                      </div>

                      {/* Detailed Complaint Body */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                          <FileWarning className="w-4 h-4 text-red-600" />
                          <span>Report Description / Evidence</span>
                          {rep.reporter_name && (
                            <span className="font-normal text-gray-400">
                              (Filed by: {rep.reporter_name} {rep.reporter_email ? `<${rep.reporter_email}>` : ''})
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-800 bg-red-50/50 p-3.5 rounded-xl border border-red-100/80 leading-relaxed">
                          {rep.description}
                        </p>
                      </div>

                      {/* Admin Notes if resolved */}
                      {rep.admin_notes && (
                        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-200">
                          <span className="font-bold text-gray-900">Admin Investigation Note: </span>
                          <span>{rep.admin_notes}</span>
                        </div>
                      )}

                      {/* Action Buttons for Report */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
                        {/* Direct Enforcement Actions */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTakeDownFromReport(rep.campaign_id, rep.campaign_title, rep.id)}
                            icon={Trash2}
                            className="!text-red-600 !border-red-200 hover:!bg-red-50"
                          >
                            Take Down Campaign
                          </Button>

                          {!creatorDeactivated && rep.creator_id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeactivateCreatorFromReport(rep.creator_id, rep.creator_name, rep.id)}
                              icon={UserX}
                              className="!text-amber-700 !border-amber-200 hover:!bg-amber-50"
                            >
                              Deactivate Creator
                            </Button>
                          )}
                        </div>

                        {/* Resolution Actions */}
                        <div className="flex items-center gap-2">
                          {isPending && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResolveReport(rep.id, 'dismissed')}
                                icon={XCircle}
                              >
                                Dismiss Report
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleResolveReport(rep.id, 'resolved')}
                                icon={CheckCircle2}
                                className="!bg-emerald-600 hover:!bg-emerald-700"
                              >
                                Mark Resolved
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: USER MANAGEMENT (DEACTIVATE / REACTIVATE) */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Sub-filters for Users */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setUserStatusFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  userStatusFilter === 'all'
                    ? 'bg-[#007979] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Accounts ({users.length})
              </button>
              <button
                type="button"
                onClick={() => setUserStatusFilter('active')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  userStatusFilter === 'active'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Active ({activeUsersCount})
              </button>
              <button
                type="button"
                onClick={() => setUserStatusFilter('deactivated')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  userStatusFilter === 'deactivated'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Suspended / Deactivated ({deactivatedUsersCount})
              </button>
            </div>

            <p className="text-xs text-gray-500 font-medium">
              Deactivated accounts cannot sign in or initiate fundraisers.
            </p>
          </div>

          {/* Search & Department Filters for Users */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <div className="md:col-span-2">
              <SearchBar
                value={userSearchQuery}
                onChange={setUserSearchQuery}
                placeholder="Search user name, email address, or university ID..."
              />
            </div>
            <div>
              <select
                value={userDeptFilter}
                onChange={(e) => setUserDeptFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#24B1B1]"
              >
                <option value="All">All Departments</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Users Management Table */}
          {filteredUsers.length === 0 ? (
            <EmptyState
              title="No users match search criteria"
              description="There are no campus accounts matching this status, department, or search query."
              actionLabel="Reset User Filters"
              onAction={() => {
                setUserStatusFilter('all');
                setUserSearchQuery('');
                setUserDeptFilter('All');
              }}
            />
          ) : (
            <Card className="p-6 border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Campus Account Directory & Access Control
                  </h3>
                  <p className="text-xs text-gray-500">
                    Manage student and faculty account status and security credentials.
                  </p>
                </div>
                <span className="text-xs font-bold text-gray-500">
                  {filteredUsers.length} Users Listed
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <th className="pb-3">User & University ID</th>
                      <th className="pb-3">Role</th>
                      <th className="pb-3">Department</th>
                      <th className="pb-3">Campaigns</th>
                      <th className="pb-3">Account Status</th>
                      <th className="pb-3 text-right">Access Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map((u) => {
                      const isCurrentUser = String(u.id) === String(currentUser?.id);
                      const isDeactivated = u.status === 'deactivated';

                      return (
                        <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3.5 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#007979]/10 text-[#007979] flex items-center justify-center font-bold text-sm shrink-0">
                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {isCurrentUser && (
                                    <span className="text-[10px] font-extrabold text-[#007979] bg-[#007979]/10 px-1.5 py-0.2 rounded">
                                      YOU
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-500">{u.email}</p>
                                {u.university_id && (
                                  <p className="text-[11px] text-gray-400 font-mono">{u.university_id}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 pr-4">
                            <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-800">
                              {u.user_type || 'Student'}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4 text-xs font-medium text-gray-700">
                            {u.department}
                          </td>
                          <td className="py-3.5 pr-4 text-xs font-bold text-gray-900">
                            {u.campaign_count ?? 0}
                          </td>
                          <td className="py-3.5 pr-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                isDeactivated
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isDeactivated ? '✕ Deactivated' : '✓ Active'}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            {isCurrentUser ? (
                              <span className="text-xs text-gray-400 italic">Self (Protected)</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleUserStatus(u.id, u.name, u.status)}
                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                                  isDeactivated
                                    ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                    : 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100'
                                }`}
                              >
                                {isDeactivated ? (
                                  <>
                                    <UserCheck className="w-3.5 h-3.5" />
                                    <span>Reactivate</span>
                                  </>
                                ) : (
                                  <>
                                    <UserX className="w-3.5 h-3.5" />
                                    <span>Deactivate</span>
                                  </>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: EXPENSE RECEIPTS & TRANSPARENCY AUDIT */}
      {/* ========================================================================= */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExpenseStatusFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  expenseStatusFilter === 'all'
                    ? 'bg-[#007979] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Receipts ({expenses.length})
              </button>
              <button
                type="button"
                onClick={() => setExpenseStatusFilter('pending')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  expenseStatusFilter === 'pending'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Pending Audit ({pendingExpensesCount})
              </button>
              <button
                type="button"
                onClick={() => setExpenseStatusFilter('verified')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  expenseStatusFilter === 'verified'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Verified ({expenses.filter((e) => e.status === 'verified').length})
              </button>
              <button
                type="button"
                onClick={() => setExpenseStatusFilter('rejected')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  expenseStatusFilter === 'rejected'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Flagged ({expenses.filter((e) => e.status === 'rejected').length})
              </button>
            </div>
            <p className="text-xs text-gray-500 font-medium hidden sm:block">
              Ensures donors see verified financial utilization receipts.
            </p>
          </div>

          {filteredExpenses.length === 0 ? (
            <EmptyState
              title="No expense receipts found"
              description="There are currently no expense receipts matching this status filter."
              actionLabel="Show All Receipts"
              onAction={() => setExpenseStatusFilter('all')}
            />
          ) : (
            <div className="space-y-3">
              {filteredExpenses.map((exp) => {
                const status = exp.status || 'pending';
                return (
                  <Card key={exp.id} className="p-5 border border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <Receipt className="w-6 h-6" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-[#007979] bg-[#007979]/10 px-2.5 py-0.5 rounded-md">
                              {exp.campaign_title}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase ${
                                status === 'verified'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {status === 'verified'
                                ? '✓ Verified'
                                : status === 'rejected'
                                ? '✕ Flagged'
                                : '⏳ Pending Audit'}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-gray-900">{exp.title}</h4>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                            <span className="font-bold text-[#E37434]">
                              Amount: {formatCurrency(exp.amount)}
                            </span>
                            <span>•</span>
                            <span>Vendor: {exp.vendor || 'Authorized Supplier'}</span>
                            <span>•</span>
                            <span>Category: {exp.category || 'Equipment'}</span>
                            <span>•</span>
                            <span>Date: {formatDate(exp.created_at)}</span>
                          </div>
                          {exp.admin_notes && (
                            <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100 italic">
                              <span className="font-bold not-italic text-gray-700">Audit Note: </span>
                              {exp.admin_notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        {exp.receipt_url && (
                          <a
                            href={exp.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#007979] bg-[#007979]/10 hover:bg-[#007979]/20 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View Invoice
                          </a>
                        )}

                        {status !== 'verified' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              handleUpdateExpenseStatus(
                                exp.id,
                                'verified',
                                'Verified with original invoice and expenditure declaration.'
                              )
                            }
                            icon={CheckCircle2}
                            className="!bg-emerald-600 hover:!bg-emerald-700"
                          >
                            Mark Verified
                          </Button>
                        )}

                        {status !== 'rejected' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const notes = window.prompt(
                                'Enter audit note / reason for flagging this receipt:'
                              );
                              if (notes !== null) {
                                handleUpdateExpenseStatus(exp.id, 'rejected', notes);
                              }
                            }}
                            icon={XCircle}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            Flag
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PLATFORM MODERATION & ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Distribution Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 border border-gray-200 shadow-xs">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#007979]" />
                Campaigns by Category
              </h3>
              <div className="space-y-3">
                {Object.entries(stats?.categoryDistribution || {}).map(([category, count]) => {
                  const pct = Math.round((count / (campaigns.length || 1)) * 100);
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-gray-700">{category}</span>
                        <span className="text-[#007979]">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#007979]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6 border border-gray-200 shadow-xs">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#E37434]" />
                Campaigns by Department
              </h3>
              <div className="space-y-3">
                {Object.entries(stats?.departmentDistribution || {}).map(([dept, count]) => {
                  const pct = Math.round((count / (campaigns.length || 1)) * 100);
                  return (
                    <div key={dept} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-gray-700 truncate max-w-[260px]">{dept}</span>
                        <span className="text-[#E37434]">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#E37434]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Master Moderation & Removal Table */}
          <Card className="p-6 border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Platform Moderation & Direct Campaign Removal
                </h3>
                <p className="text-xs text-gray-500">
                  Full list of all active, pending, and rejected campaigns with permanent take-down capability.
                </p>
              </div>
              <span className="text-xs font-bold text-gray-500">
                Total: {campaigns.length} initiatives
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="pb-3">Title & Category</th>
                    <th className="pb-3">Creator</th>
                    <th className="pb-3">Goal</th>
                    <th className="pb-3">Raised</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Moderation & Removal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {campaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 pr-4">
                        <p className="font-bold text-gray-900 line-clamp-1">{camp.title}</p>
                        <p className="text-xs text-[#007979]">{camp.category}</p>
                      </td>
                      <td className="py-3.5 pr-4">
                        <p className="font-semibold text-gray-800">{camp.creator_name}</p>
                        <p className="text-xs text-gray-500">{camp.creator_department}</p>
                      </td>
                      <td className="py-3.5 pr-4 font-semibold text-gray-700">
                        {formatCurrency(camp.goal_amount)}
                      </td>
                      <td className="py-3.5 pr-4 font-bold text-[#E37434]">
                        {formatCurrency(camp.amount_raised || 0)}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                            camp.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : camp.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {camp.status || 'pending'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenReview(camp)}
                          icon={Eye}
                        >
                          Inspect
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCampaign(camp.id, camp.title)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
                          title="Remove Campaign from Platform"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Document Verification Dossier Inspection Modal */}
      <DocumentVerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaign={selectedCampaign}
        onApprove={handleApproveCampaign}
        onReject={handleRejectCampaign}
        isProcessing={actionProcessing}
      />
    </div>
  );
}
