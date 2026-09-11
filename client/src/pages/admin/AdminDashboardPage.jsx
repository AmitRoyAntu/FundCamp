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
  LayoutDashboard,
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
  Activity,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Check,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { currentUser } = useAuth();

  // Active Tab State: 'overview' | 'queue' | 'reports' | 'users' | 'expenses' | 'campaigns'
  const [activeTab, setActiveTab] = useState('overview');

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

  // Verification Queue Filter States
  const [statusFilter, setStatusFilter] = useState('pending'); // 'pending' | 'approved' | 'rejected' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  // Reports Filter States
  const [reportStatusFilter, setReportStatusFilter] = useState('pending'); // 'pending' | 'resolved' | 'dismissed' | 'all'
  const [reportSearchQuery, setReportSearchQuery] = useState('');

  // Users Filter States
  const [userStatusFilter, setUserStatusFilter] = useState('all'); // 'all' | 'active' | 'deactivated'
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userDeptFilter, setUserDeptFilter] = useState('All');

  // Expense Filter States
  const [expenseStatusFilter, setExpenseStatusFilter] = useState('all');

  // Campaign Directory Search
  const [campaignDirectorySearch, setCampaignDirectorySearch] = useState('');

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
      setCampaigns(campaignsData || []);
      setExpenses(expensesData || []);
      setReports(reportsData || []);
      setUsers(usersData || []);
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
      setCampaigns(campaignsData || []);
      setExpenses(expensesData || []);
      setReports(reportsData || []);
      setUsers(usersData || []);
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
      c.title?.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query) ||
      c.creator_name?.toLowerCase().includes(query);

    return statusMatch && categoryMatch && deptMatch && searchMatch;
  });

  // Filtered Reports
  const filteredReports = reports.filter((r) => {
    const statusMatch = reportStatusFilter === 'all' || (r.status || 'pending') === reportStatusFilter;
    const query = reportSearchQuery.toLowerCase().trim();
    const searchMatch =
      !query ||
      r.campaign_title?.toLowerCase().includes(query) ||
      r.reason?.toLowerCase().includes(query) ||
      r.description?.toLowerCase().includes(query) ||
      r.reporter_name?.toLowerCase().includes(query);
    return statusMatch && searchMatch;
  });

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const statusMatch = userStatusFilter === 'all' || (u.status || 'active') === userStatusFilter;
    const deptMatch = userDeptFilter === 'All' || u.department === userDeptFilter;
    const query = userSearchQuery.toLowerCase().trim();
    const searchMatch =
      !query ||
      u.name?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      (u.university_id && u.university_id.toLowerCase().includes(query));

    return statusMatch && deptMatch && searchMatch;
  });

  // Filtered Expenses
  const filteredExpenses = expenses.filter((e) => {
    if (expenseStatusFilter === 'all') return true;
    return e.status === expenseStatusFilter;
  });

  // Filtered Master Campaign Directory
  const filteredDirectoryCampaigns = campaigns.filter((c) => {
    const query = campaignDirectorySearch.toLowerCase().trim();
    return (
      !query ||
      c.title?.toLowerCase().includes(query) ||
      c.creator_name?.toLowerCase().includes(query) ||
      c.category?.toLowerCase().includes(query) ||
      c.department?.toLowerCase().includes(query)
    );
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
  const verifiedExpensesCount = expenses.filter((e) => e.status === 'verified').length;

  const totalRaised = stats?.campaigns?.totalRaised ?? campaigns.reduce((acc, c) => acc + (parseFloat(c.amount_raised) || 0), 0);
  const totalGoal = stats?.campaigns?.totalGoal ?? campaigns.reduce((acc, c) => acc + (parseFloat(c.goal_amount) || 0), 0);
  const goalPercentage = totalGoal > 0 ? Math.min(100, Math.round((totalRaised / totalGoal) * 100)) : 0;

  // Monthly Volume for Bar Chart
  const monthlyData = stats?.monthlyVolume || [
    { month: 'Oct', volume: 1500, count: 4 },
    { month: 'Nov', volume: 2200, count: 6 },
    { month: 'Dec', volume: 3800, count: 9 },
    { month: 'Jan', volume: 5400, count: 14 },
    { month: 'Feb', volume: 8200, count: 19 },
    { month: 'Mar', volume: totalRaised || 11700, count: campaigns.length || 4 },
  ];
  const maxMonthVolume = Math.max(...monthlyData.map((m) => m.volume), 1);

  // Sidebar navigation tabs definition
  const sidebarItems = [
    {
      id: 'overview',
      label: 'Platform Overview',
      icon: LayoutDashboard,
      badge: null,
      description: 'System stats & charts',
    },
    {
      id: 'queue',
      label: 'Verification Queue',
      icon: ShieldCheck,
      badge: pendingCampaignsCount,
      badgeColor: 'amber',
      description: 'Review pending initiatives',
    },
    {
      id: 'reports',
      label: 'Fraud & Moderation',
      icon: ShieldAlert,
      badge: pendingReportsCount,
      badgeColor: 'red',
      description: 'Investigate complaints',
    },
    {
      id: 'users',
      label: 'Campus Accounts',
      icon: Users,
      badge: deactivatedUsersCount > 0 ? `${deactivatedUsersCount} Suspended` : null,
      badgeColor: 'gray',
      description: 'Student & faculty access',
    },
    {
      id: 'expenses',
      label: 'Expense Receipts',
      icon: Receipt,
      badge: pendingExpensesCount,
      badgeColor: 'blue',
      description: 'Financial accountability',
    },
    {
      id: 'campaigns',
      label: 'Campaign Directory',
      icon: Layers,
      badge: campaigns.length,
      badgeColor: 'teal',
      description: 'Manage & direct removal',
    },
  ];

  if (loading) {
    return <Loader text="Loading University Administration Hub..." />;
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <PageHeader
        title="University Verification & Moderation Hub"
        description="Official campus administration gateway to monitor platform metrics, verify submitted initiatives, resolve policy reports, and oversee user governance."
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

      {/* Main Two-Column Layout: Left Side Navbar + Right Content */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT SIDE NAVBAR (STICKY DESKTOP, HORIZONTAL MOBILE) */}
        {/* ========================================================================= */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sticky top-20 space-y-4">
            {/* Admin Profile Mini Card */}
            <div className="p-3 bg-gradient-to-br from-[#007979]/10 to-[#24B1B1]/5 rounded-xl border border-[#007979]/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#007979] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                ADM
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {currentUser?.fullName || 'Campus Administrator'}
                  </p>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#007979] text-white">
                    PORTAL
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 truncate">
                  {currentUser?.department || 'Student Affairs & Research'}
                </p>
              </div>
            </div>

            {/* Navigation Menu Links */}
            <div className="space-y-1">
              <p className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Management Modules
              </p>
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-[#007979] text-white shadow-xs font-bold'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4.5 h-4.5 shrink-0 ${
                          isSelected ? 'text-white' : 'text-[#007979]'
                        }`}
                      />
                      <div className="truncate">
                        <p className="leading-tight truncate">{item.label}</p>
                        <p
                          className={`text-[11px] font-normal truncate ${
                            isSelected ? 'text-white/80' : 'text-gray-400'
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {item.badge !== null && item.badge !== undefined && (
                      <span
                        className={`ml-2 px-2 py-0.5 rounded-full text-xs font-extrabold shrink-0 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : item.badgeColor === 'red'
                            ? 'bg-red-100 text-red-700 animate-pulse'
                            : item.badgeColor === 'amber'
                            ? 'bg-amber-100 text-amber-800'
                            : item.badgeColor === 'blue'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Status Pill */}
            <div className="pt-3 border-t border-gray-100 px-2 space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Platform Gateway</span>
                </span>
                <span className="font-bold text-emerald-600">Online</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>Total Campaigns:</span>
                <span className="font-semibold text-gray-700">{campaigns.length}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>Raised Volume:</span>
                <span className="font-bold text-[#E37434]">{formatCurrency(totalRaised)}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* RIGHT WORKSPACE AREA */}
        {/* ========================================================================= */}
        <main className="flex-1 min-w-0 w-full space-y-6">
          {/* ========================================================================= */}
          {/* MODULE 1: PLATFORM OVERVIEW (COMBINED COMPREHENSIVE DASHBOARD) */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Urgent Action Center / Triage Banners */}
              {(pendingCampaignsCount > 0 || pendingReportsCount > 0 || pendingExpensesCount > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pendingCampaignsCount > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-amber-900">
                            {pendingCampaignsCount} Campaign{pendingCampaignsCount > 1 ? 's' : ''} Awaiting Clearance
                          </p>
                          <p className="text-xs text-amber-700">
                            Review documents before public publication
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab('queue')}
                        className="bg-white border-amber-300 text-amber-800 hover:bg-amber-100 shrink-0"
                      >
                        Open Queue →
                      </Button>
                    </div>
                  )}

                  {pendingReportsCount > 0 && (
                    <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200/80 flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-red-900">
                            {pendingReportsCount} Fraud Complaint Pending
                          </p>
                          <p className="text-xs text-red-700">
                            Urgent policy violation filed by campus member
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab('reports')}
                        className="bg-white border-red-300 text-red-800 hover:bg-red-100 shrink-0"
                      >
                        Investigate →
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* 4 Core KPI Summary Cards (The Upper Screenshot Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1: Verification Queue */}
                <Card
                  className="p-5 border-l-4 border-l-amber-500 bg-white shadow-xs cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setActiveTab('queue')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Verification Queue
                      </p>
                      <h3 className="text-3xl font-extrabold text-gray-900 mt-1">
                        {pendingCampaignsCount}
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
                <Card
                  className={`p-5 border-l-4 ${pendingReportsCount > 0 ? 'border-l-red-500' : 'border-l-gray-300'} bg-white shadow-xs cursor-pointer hover:shadow-md transition-shadow`}
                  onClick={() => setActiveTab('reports')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Fraud & Policy Reports
                      </p>
                      <h3 className={`text-3xl font-extrabold ${pendingReportsCount > 0 ? 'text-red-600' : 'text-gray-900'} mt-1`}>
                        {pendingReportsCount}
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
                <Card
                  className="p-5 border-l-4 border-l-[#007979] bg-white shadow-xs cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setActiveTab('users')}
                >
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

                {/* Metric 4: Total Raised Volume */}
                <Card className="p-5 border-l-4 border-l-[#E37434] bg-white shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Total Raised Volume
                      </p>
                      <h3 className="text-2xl font-extrabold text-gray-900 mt-1">
                        {formatCurrency(totalRaised)}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Target: {formatCurrency(totalGoal)} ({goalPercentage}%)
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-[#E37434]/10 text-[#E37434] flex items-center justify-center">
                      <Coins className="w-6 h-6" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Month-by-Month Fundraising Volume Bar Chart */}
              <Card className="p-6 border border-gray-200 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#007979]" />
                      <h3 className="text-lg font-bold text-gray-900">
                        Monthly Backing Volume & Trend Analysis
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Platform-wide verified monthly capital contributions across student, faculty, and research initiatives.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +42.7% MoM Growth
                    </span>
                    <span className="text-xs font-semibold text-gray-500">
                      Last 6 Months
                    </span>
                  </div>
                </div>

                {/* SVG/CSS Interactive Bar Chart */}
                <div className="space-y-2">
                  <div className="h-60 flex items-end justify-between gap-3 pt-8 pb-2 px-4 bg-gray-50/70 rounded-2xl border border-gray-100">
                    {monthlyData.map((item, idx) => {
                      const heightPercent = Math.max(12, Math.round((item.volume / maxMonthVolume) * 100));
                      const isCurrentMonth = idx === monthlyData.length - 1;

                      return (
                        <div
                          key={item.month}
                          className="flex-1 flex flex-col items-center h-full justify-end group relative"
                        >
                          {/* Tooltip on Hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 bg-gray-900 text-white text-[11px] font-bold py-1 px-2.5 rounded-lg whitespace-nowrap pointer-events-none shadow-md z-10">
                            {item.month}: {formatCurrency(item.volume)}
                            <div className="text-[9px] text-gray-300 font-normal">
                              {item.count} campaigns active
                            </div>
                          </div>

                          {/* Bar Fill */}
                          <div className="w-full max-w-[48px] flex flex-col items-center">
                            <span className="text-[11px] font-bold mb-1 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                              {formatCurrency(item.volume)}
                            </span>
                            <div
                              className={`w-full rounded-t-xl transition-all duration-500 group-hover:scale-y-105 origin-bottom ${
                                isCurrentMonth
                                  ? 'bg-gradient-to-t from-[#007979] to-[#24B1B1] shadow-xs'
                                  : 'bg-gradient-to-t from-gray-300 to-[#007979]/40 group-hover:from-[#007979]/60 group-hover:to-[#24B1B1]/70'
                              }`}
                              style={{ height: `${heightPercent}%` }}
                            />
                          </div>

                          {/* Month Label */}
                          <span className={`text-xs mt-2 font-semibold ${isCurrentMonth ? 'text-[#007979] font-bold' : 'text-gray-500'}`}>
                            {item.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Progress Meter: Goal vs Raised */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-gray-700">
                    <span>Overall Platform Goal Progress</span>
                    <span className="text-[#E37434]">
                      {formatCurrency(totalRaised)} / {formatCurrency(totalGoal)} ({goalPercentage}%)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#007979] via-[#24B1B1] to-[#E37434] transition-all duration-500"
                      style={{ width: `${goalPercentage}%` }}
                    />
                  </div>
                </div>
              </Card>

              {/* Two-Column Breakdown: Categories & Departments */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Distribution */}
                <Card className="p-6 border border-gray-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-[#007979]" />
                      Campaigns by Category
                    </h3>
                    <span className="text-xs text-gray-500 font-semibold">
                      {campaigns.length} Total
                    </span>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(stats?.categoryDistribution || {}).map(([category, count]) => {
                      const pct = Math.round((count / (campaigns.length || 1)) * 100);
                      return (
                        <div key={category} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-gray-700">{category}</span>
                            <span className="text-[#007979]">
                              {count} campaign{count > 1 ? 's' : ''} ({pct}%)
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

                {/* Department Distribution */}
                <Card className="p-6 border border-gray-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-[#E37434]" />
                      Campaigns by Academic Department
                    </h3>
                    <span className="text-xs text-gray-500 font-semibold">
                      Campus Origin
                    </span>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(stats?.departmentDistribution || {}).map(([dept, count]) => {
                      const pct = Math.round((count / (campaigns.length || 1)) * 100);
                      return (
                        <div key={dept} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-gray-700 truncate max-w-[240px]">{dept}</span>
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

              {/* Recent Platform Activity Audit Feed */}
              <Card className="p-6 border border-gray-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#007979]" />
                    <h3 className="text-base font-bold text-gray-900">
                      Recent Administrative & Campus Activities
                    </h3>
                  </div>
                  <span className="text-xs text-gray-400">Live Audit Trail</span>
                </div>

                <div className="divide-y divide-gray-100">
                  {(stats?.recentActivity || []).map((act) => (
                    <div key={act.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            act.type === 'report'
                              ? 'bg-red-50 text-red-600'
                              : act.type === 'expense'
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {act.type === 'report' ? (
                            <ShieldAlert className="w-4 h-4" />
                          ) : act.type === 'expense' ? (
                            <Receipt className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {act.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            By <span className="font-medium text-gray-700">{act.actor}</span> • {act.time}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider shrink-0 ${
                          act.status === 'verified' || act.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : act.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {act.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODULE 2: VERIFICATION QUEUE */}
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
          {/* MODULE 3: FRAUD & MODERATION REPORTS */}
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
                    Pending Review ({pendingReportsCount})
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

                <div className="w-full sm:w-64">
                  <SearchBar
                    value={reportSearchQuery}
                    onChange={setReportSearchQuery}
                    placeholder="Search reports or reason..."
                  />
                </div>
              </div>

              {/* Reports List */}
              {filteredReports.length === 0 ? (
                <EmptyState
                  title="No reports match this status"
                  description="Great news! There are no outstanding fraud or policy violation complaints in this queue."
                  actionLabel="View All Reports"
                  onAction={() => setReportStatusFilter('all')}
                />
              ) : (
                <div className="space-y-4">
                  {filteredReports.map((rep) => {
                    const isPending = (rep.status || 'pending') === 'pending';
                    return (
                      <Card
                        key={rep.id}
                        className={`p-6 border ${
                          isPending ? 'border-red-200 bg-red-50/20' : 'border-gray-200'
                        } space-y-4 shadow-xs`}
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-red-100 text-red-800 flex items-center gap-1">
                                <Flag className="w-3.5 h-3.5" />
                                {rep.reason}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                                  rep.status === 'resolved'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : rep.status === 'dismissed'
                                    ? 'bg-gray-200 text-gray-700'
                                    : 'bg-red-500 text-white animate-pulse'
                                }`}
                              >
                                {rep.status || 'pending'}
                              </span>
                              <span className="text-xs text-gray-400">
                                Logged: {formatDate(rep.created_at)}
                              </span>
                            </div>

                            <h4 className="text-base font-bold text-gray-900">
                              Target Campaign: <span className="text-[#007979]">{rep.campaign_title || `Campaign #${rep.campaign_id}`}</span>
                            </h4>

                            <div className="p-3.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-800 leading-relaxed shadow-2xs">
                              <p className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-1">
                                Complaint Details:
                              </p>
                              {rep.description}
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-1">
                              <span>
                                <strong className="text-gray-900">Reporter:</strong> {rep.reporter_name || 'Anonymous'}{' '}
                                {rep.reporter_email && `(${rep.reporter_email})`}
                              </span>
                              <span>•</span>
                              <span>
                                <strong className="text-gray-900">Campaign Creator:</strong> {rep.creator_name || 'Campus Creator'}
                              </span>
                              {rep.creator_status === 'deactivated' && (
                                <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold">
                                  Creator Deactivated
                                </span>
                              )}
                            </div>

                            {rep.admin_notes && (
                              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                                <strong className="font-bold">Investigation Findings / Action: </strong>
                                {rep.admin_notes}
                              </div>
                            )}
                          </div>

                          {/* Action Controls */}
                          <div className="flex flex-row md:flex-col gap-2 shrink-0 self-end md:self-start">
                            {isPending && (
                              <>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleResolveReport(rep.id, 'resolved')}
                                  icon={CheckCircle2}
                                  className="!bg-emerald-600 hover:!bg-emerald-700 w-full"
                                >
                                  Resolve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleResolveReport(rep.id, 'dismissed')}
                                  icon={XCircle}
                                  className="w-full"
                                >
                                  Dismiss
                                </Button>
                              </>
                            )}

                            <button
                              type="button"
                              onClick={() => handleTakeDownFromReport(rep.campaign_id, rep.campaign_title, rep.id)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 border border-red-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer w-full"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Take Down Campaign</span>
                            </button>

                            {rep.creator_id && rep.creator_status !== 'deactivated' && (
                              <button
                                type="button"
                                onClick={() => handleDeactivateCreatorFromReport(rep.creator_id, rep.creator_name, rep.id)}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-red-50 hover:text-red-700 border border-gray-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer w-full"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                <span>Suspend Creator</span>
                              </button>
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
          {/* MODULE 4: USER ACCOUNTS (DEACTIVATE / REACTIVATE) */}
          {/* ========================================================================= */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Search & Filters for Users */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <div className="md:col-span-1">
                  <SearchBar
                    value={userSearchQuery}
                    onChange={setUserSearchQuery}
                    placeholder="Search name, email, ID..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUserStatusFilter('all')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      userStatusFilter === 'all'
                        ? 'bg-[#007979] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All ({users.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserStatusFilter('active')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      userStatusFilter === 'active'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Active ({activeUsersCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserStatusFilter('deactivated')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      userStatusFilter === 'deactivated'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Suspended ({deactivatedUsersCount})
                  </button>
                </div>

                <div>
                  <select
                    value={userDeptFilter}
                    onChange={(e) => setUserDeptFilter(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#24B1B1]"
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

              {/* Users Table Card */}
              <Card className="p-6 border border-gray-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Campus User Directory & Access Control
                    </h3>
                    <p className="text-xs text-gray-500">
                      Manage campus accounts, restrict abusive campaign creators, and maintain student safety.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-gray-500">
                    {filteredUsers.length} account{filteredUsers.length > 1 ? 's' : ''} shown
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <th className="pb-3">User & Email</th>
                        <th className="pb-3">Role & Dept</th>
                        <th className="pb-3">University ID</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Account Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.map((u) => {
                        const isDeactivated = u.status === 'deactivated';
                        const isSelf = String(u.id) === String(currentUser?.id);

                        return (
                          <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-3.5 pr-4">
                              <p className="font-bold text-gray-900">{u.name}</p>
                              <p className="text-xs text-gray-500">{u.email}</p>
                            </td>
                            <td className="py-3.5 pr-4">
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-[#007979]/10 text-[#007979]">
                                {u.user_type || u.userType || 'Student'}
                              </span>
                              <p className="text-xs text-gray-600 mt-0.5">{u.department || 'General'}</p>
                            </td>
                            <td className="py-3.5 pr-4 font-mono text-xs text-gray-600">
                              {u.university_id || 'STU-2026'}
                            </td>
                            <td className="py-3.5 pr-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                                  isDeactivated
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {isDeactivated ? '✕ Suspended' : '✓ Active'}
                              </span>
                            </td>
                            <td className="py-3.5 text-right">
                              {isSelf ? (
                                <span className="text-xs text-gray-400 italic">Self Account</span>
                              ) : isDeactivated ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleUserStatus(u.id, u.name, u.status)}
                                  icon={UserCheck}
                                  className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                                >
                                  Reactivate Access
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleUserStatus(u.id, u.name, u.status)}
                                  icon={UserX}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  Deactivate Account
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODULE 5: EXPENSE RECEIPTS AUDIT */}
          {/* ========================================================================= */}
          {activeTab === 'expenses' && (
            <div className="space-y-6">
              {/* Filter Pills */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <div className="flex items-center gap-2 flex-wrap">
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
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Pending Verification ({pendingExpensesCount})
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
                    Verified ({verifiedExpensesCount})
                  </button>
                </div>

                <div className="text-xs text-gray-500 font-medium">
                  Showing <span className="font-bold text-gray-900">{filteredExpenses.length}</span> receipts
                </div>
              </div>

              {/* Expense Receipts Grid */}
              {filteredExpenses.length === 0 ? (
                <EmptyState
                  title="No expense receipts found"
                  description="There are currently no uploaded vendor invoices or receipts matching this filter."
                  actionLabel="Show All Receipts"
                  onAction={() => setExpenseStatusFilter('all')}
                />
              ) : (
                <div className="space-y-3">
                  {filteredExpenses.map((exp) => {
                    const status = exp.status || 'pending';
                    return (
                      <Card
                        key={exp.id}
                        className="p-5 border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            {/* Receipt Thumbnail */}
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                              {exp.receipt_url ? (
                                <img
                                  src={exp.receipt_url}
                                  alt={exp.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Receipt className="w-6 h-6" />
                                </div>
                              )}
                            </div>

                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#007979]/10 text-[#007979]">
                                  {exp.category || 'Expenditure'}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                                    status === 'verified'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : status === 'rejected'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {status === 'verified'
                                    ? '✓ Verified'
                                    : status === 'rejected'
                                    ? '✕ Flagged'
                                    : '⏳ Pending Audit'}
                                </span>
                              </div>

                              <h4 className="text-base font-bold text-gray-900 truncate">
                                {exp.title}
                              </h4>

                              <p className="text-xs text-gray-600">
                                Campaign: <strong className="text-gray-900">{exp.campaign_title}</strong> • Vendor: {exp.vendor}
                              </p>

                              <div className="flex items-center gap-3 text-xs text-gray-500 pt-0.5">
                                <span className="font-bold text-[#E37434] text-sm">
                                  {formatCurrency(exp.amount)}
                                </span>
                                <span>•</span>
                                <span>Uploaded: {formatDate(exp.created_at)}</span>
                              </div>

                              {exp.admin_notes && (
                                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100 italic">
                                  <span className="font-bold not-italic text-gray-700">Audit Notes: </span>
                                  {exp.admin_notes}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
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
          {/* MODULE 6: CAMPAIGN DIRECTORY & PERMANENT REMOVAL */}
          {/* ========================================================================= */}
          {activeTab === 'campaigns' && (
            <div className="space-y-6">
              <Card className="p-6 border border-gray-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Master Campaign Directory & Permanent Removal
                    </h3>
                    <p className="text-xs text-gray-500">
                      Complete catalog of all approved, pending, and rejected campaigns with direct takedown controls.
                    </p>
                  </div>
                  <div className="w-full sm:w-64">
                    <SearchBar
                      value={campaignDirectorySearch}
                      onChange={setCampaignDirectorySearch}
                      placeholder="Search any campaign..."
                    />
                  </div>
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
                      {filteredDirectoryCampaigns.map((camp) => (
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
        </main>
      </div>

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
