import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import DocumentVerificationModal from '../../components/admin/DocumentVerificationModal';
import UserProfileDossierModal from '../../components/admin/UserProfileDossierModal';
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
  MessageSquare,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { currentUser } = useAuth();

  // Active Tab State: 'overview' | 'queue' | 'reports' | 'users' | 'expenses' | 'campaigns'
  const [activeTab, setActiveTab] = useState('overview');

  // Trend Chart Selected Metric: 'volume' | 'campaigns' | 'users'
  const [trendMetric, setTrendMetric] = useState('volume');

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
  const [comments, setComments] = useState([]);

  // Comment Moderation States
  const [commentSearchQuery, setCommentSearchQuery] = useState('');
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  // User Profile Dossier Modal State
  const [dossierUserId, setDossierUserId] = useState(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

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
      const [statsData, campaignsData, expensesData, reportsData, usersData, commentsData] = await Promise.all([
        adminService.getStats(),
        adminService.getCampaigns({ status: 'all' }),
        adminService.getExpenses({ status: 'all' }),
        adminService.getReports({ status: 'all' }),
        adminService.getUsers({ status: 'all' }),
        adminService.getComments(),
      ]);
      setStats(statsData);
      setCampaigns(campaignsData || []);
      setExpenses(expensesData || []);
      setReports(reportsData || []);
      setUsers(usersData || []);
      setComments(commentsData || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load administrative data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const [statsData, campaignsData, expensesData, reportsData, usersData, commentsData] = await Promise.all([
        adminService.getStats(),
        adminService.getCampaigns({ status: 'all' }),
        adminService.getExpenses({ status: 'all' }),
        adminService.getReports({ status: 'all' }),
        adminService.getUsers({ status: 'all' }),
        adminService.getComments(),
      ]);
      setStats(statsData);
      setCampaigns(campaignsData || []);
      setExpenses(expensesData || []);
      setReports(reportsData || []);
      setUsers(usersData || []);
      setComments(commentsData || []);
      toast.success('Admin data refreshed successfully');
    } catch (err) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleOpenUserDossier = (userId) => {
    if (!userId) return;
    setDossierUserId(userId);
    setIsDossierOpen(true);
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to permanently remove this comment from the platform?')) return;
    setDeletingCommentId(commentId);
    try {
      await adminService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success('Comment removed from platform');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to remove comment');
    } finally {
      setDeletingCommentId(null);
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

  // Filtered Comments for Moderation
  const filteredComments = comments.filter((c) => {
    const q = commentSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (c.content && c.content.toLowerCase().includes(q)) ||
      (c.user_name && c.user_name.toLowerCase().includes(q)) ||
      (c.campaign_title && c.campaign_title.toLowerCase().includes(q)) ||
      (c.user_department && c.user_department.toLowerCase().includes(q))
    );
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

  // Monthly trends data
  const rawMonthlyTrends = stats?.monthlyTrends || stats?.monthlyVolume || [
    { month: 'Oct', volume: 1500, campaigns: 1, users: 1 },
    { month: 'Nov', volume: 2200, campaigns: 2, users: 1 },
    { month: 'Dec', volume: 3800, campaigns: 2, users: 2 },
    { month: 'Jan', volume: 5400, campaigns: 3, users: 2 },
    { month: 'Feb', volume: 8200, campaigns: 3, users: 3 },
    { month: 'Mar', volume: totalRaised || 11700, campaigns: campaigns.length || 4, users: users.length || 3 },
  ];

  // Configure trend metric options
  const trendConfig = {
    volume: {
      title: 'Donations Growth Trend',
      description: 'Monthly capital contributions received across all faculties',
      color: '#007979',
      lightColor: '#24B1B1',
      badge: '+42.7% MoM',
      getValue: (d) => d.volume || 0,
      formatVal: (v) => formatCurrency(v),
      formatShort: (v) => `৳${Math.round(v / 1000)}k`,
      currentTotal: formatCurrency(totalRaised || 11700),
      summaryLabel: 'Total Platform Volume',
    },
    campaigns: {
      title: 'Initiatives Growth Trend',
      description: 'Submitted and launched student & faculty initiatives per month',
      color: '#E37434',
      lightColor: '#F59E0B',
      badge: '+33.3% MoM',
      getValue: (d) => d.campaigns || 1,
      formatVal: (v) => `${v} campaigns`,
      formatShort: (v) => `${v}`,
      currentTotal: `${campaigns.length || 4} Campaigns`,
      summaryLabel: 'Total Initiatives',
    },
    users: {
      title: 'User Registration Trend',
      description: 'New verified campus members (students, faculty, administrators)',
      color: '#2563EB',
      lightColor: '#60A5FA',
      badge: '+50.0% MoM',
      getValue: (d) => d.users || 1,
      formatVal: (v) => `${v} users`,
      formatShort: (v) => `${v}`,
      currentTotal: `${users.length || 3} Accounts`,
      summaryLabel: 'Total Campus Members',
    },
  };

  const currentTrend = trendConfig[trendMetric];
  const trendValues = rawMonthlyTrends.map((d) => currentTrend.getValue(d));
  const maxTrendVal = Math.max(...trendValues, 1);

  // Calculate SVG curve & bar coordinates
  // SVG ViewBox: 0 0 680 200
  const svgWidth = 680;
  const svgHeight = 200;
  const paddingLeft = 55;
  const paddingRight = 35;
  const paddingTop = 25;
  const paddingBottom = 35;
  const chartHeight = svgHeight - paddingTop - paddingBottom; // 140
  const chartWidth = svgWidth - paddingLeft - paddingRight; // 590

  const points = rawMonthlyTrends.map((item, i) => {
    const x = paddingLeft + (i / (rawMonthlyTrends.length - 1)) * chartWidth;
    const val = currentTrend.getValue(item);
    const normalized = maxTrendVal > 0 ? val / maxTrendVal : 0;
    const y = paddingTop + chartHeight * (1 - normalized);
    return { x, y, val, month: item.month };
  });

  // Construct smooth SVG Bezier curve path
  const linePathD = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = arr[i - 1];
    const cpX1 = prev.x + (pt.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (pt.x - prev.x) / 2;
    const cpY2 = pt.y;
    return `${acc} C ${cpX1},${cpY1} ${cpX2},${cpY2} ${pt.x},${pt.y}`;
  }, '');

  // Area under the curve
  const areaPathD = `${linePathD} L ${points[points.length - 1].x},${paddingTop + chartHeight} L ${points[0].x},${paddingTop + chartHeight} Z`;

  // Sidebar navigation items
  const sidebarItems = [
    {
      id: 'overview',
      label: 'Platform Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'queue',
      label: 'Verification Queue',
      icon: ShieldCheck,
      badge: pendingCampaignsCount,
      badgeColor: 'amber',
    },
    {
      id: 'reports',
      label: 'Fraud & Moderation',
      icon: ShieldAlert,
      badge: pendingReportsCount,
      badgeColor: 'red',
    },
    {
      id: 'users',
      label: 'Campus Accounts',
      icon: Users,
      badge: deactivatedUsersCount > 0 ? `${deactivatedUsersCount} Suspended` : null,
      badgeColor: 'gray',
    },
    {
      id: 'comments',
      label: 'Comment Moderation',
      icon: MessageSquare,
      badge: comments.length > 0 ? comments.length : null,
      badgeColor: 'teal',
    },
    {
      id: 'expenses',
      label: 'Expense Receipts',
      icon: Receipt,
      badge: pendingExpensesCount,
      badgeColor: 'blue',
    },
    {
      id: 'campaigns',
      label: 'Campaign Directory',
      icon: Layers,
      badge: campaigns.length,
      badgeColor: 'teal',
    },
  ];

  if (loading) {
    return <Loader text="Loading Administration Hub..." />;
  }

  return (
    <div className="space-y-4 pb-12 w-full">
      {/* Minimal Top Breadcrumb & Refresh Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Admin Portal</span>
          <span className="text-gray-300">•</span>
          <h2 className="text-base sm:text-lg font-extrabold text-gray-900">
            {sidebarItems.find((i) => i.id === activeTab)?.label || 'Platform Overview'}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            isLoading={refreshing}
            icon={RefreshCw}
            className="text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border-gray-200 shadow-2xs"
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Main Two-Column Layout: Compact Left Sidebar + Stretched Workspace */}
      <div className="flex flex-col lg:flex-row gap-5 items-start w-full">
        {/* ========================================================================= */}
        {/* COMPACT LEFT SIDE NAVBAR */}
        {/* ========================================================================= */}
        <aside className="w-full lg:w-60 xl:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-3 sticky top-20 space-y-3">
            {/* Admin Mini Profile */}
            <div className="p-2.5 bg-gradient-to-br from-[#007979]/10 to-[#24B1B1]/5 rounded-xl border border-[#007979]/20 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#007979] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                ADM
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 truncate leading-tight">
                  {currentUser?.fullName || 'Campus Administrator'}
                </p>
                <p className="text-[10px] text-gray-500 truncate">
                  {currentUser?.department || 'Student Affairs'}
                </p>
              </div>
            </div>

            {/* Navigation Menu Links */}
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-[#007979] text-white shadow-xs font-bold'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isSelected ? 'text-white' : 'text-[#007979]'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== null && item.badge !== undefined && (
                      <span
                        className={`ml-1.5 px-2 py-0.5 rounded-full text-[11px] font-extrabold shrink-0 ${
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
            </nav>

            {/* Quick Status Pill */}
            <div className="pt-2.5 border-t border-gray-100 px-1 text-[11px] text-gray-500 space-y-1">
              <div className="flex items-center justify-between">
                <span>Active Campaigns:</span>
                <span className="font-bold text-gray-800">{campaigns.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Raised Volume:</span>
                <span className="font-bold text-[#E37434]">{formatCurrency(totalRaised)}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* STRETCHED RIGHT WORKSPACE */}
        {/* ========================================================================= */}
        <main className="flex-1 min-w-0 w-full space-y-5">
          {/* ========================================================================= */}
          {/* MODULE 1: PLATFORM OVERVIEW (CLEAN DASHBOARD WITHOUT DUPLICATE ALERTS) */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* 4 Clean Actionable KPI Cards (NO DUPLICATE BANNERS) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Metric 1: Verification Queue */}
                <Card
                  className="p-5 border-l-4 border-l-amber-500 bg-white shadow-xs cursor-pointer hover:shadow-md hover:border-amber-400 transition-all group"
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
                      <p className="text-xs text-amber-600 font-semibold mt-1 flex items-center gap-1 group-hover:underline">
                        <span>Campaigns Awaiting Review</span>
                        <ChevronRight className="w-3.5 h-3.5 inline" />
                      </p>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                </Card>

                {/* Metric 2: Fraud & Moderation Reports */}
                <Card
                  className={`p-5 border-l-4 ${pendingReportsCount > 0 ? 'border-l-red-500' : 'border-l-gray-300'} bg-white shadow-xs cursor-pointer hover:shadow-md transition-all group`}
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
                      <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1 group-hover:underline">
                        <span>{pendingReportsCount > 0 ? 'Urgent Review Needed' : 'No Open Complaints'}</span>
                        <ChevronRight className="w-3.5 h-3.5 inline" />
                      </p>
                    </div>
                    <div className={`w-11 h-11 rounded-xl ${pendingReportsCount > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'} flex items-center justify-center`}>
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                  </div>
                </Card>

                {/* Metric 3: Campus User Accounts */}
                <Card
                  className="p-5 border-l-4 border-l-[#007979] bg-white shadow-xs cursor-pointer hover:shadow-md transition-all group"
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
                      <p className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-1 group-hover:underline">
                        <span>{activeUsersCount} Active • <strong className={deactivatedUsersCount > 0 ? 'text-red-600' : ''}>{deactivatedUsersCount} Suspended</strong></span>
                        <ChevronRight className="w-3.5 h-3.5 inline" />
                      </p>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-[#007979]/10 text-[#007979] flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                </Card>

                {/* Metric 4: Total Raised Volume */}
                <Card
                  className="p-5 border-l-4 border-l-[#E37434] bg-white shadow-xs cursor-pointer hover:shadow-md transition-all"
                  onClick={() => setActiveTab('campaigns')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Total Raised Volume
                      </p>
                      <h3 className="text-2xl font-extrabold text-gray-900 mt-1">
                        {formatCurrency(totalRaised)}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Across {campaigns.length} university initiatives
                      </p>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-[#E37434]/10 text-[#E37434] flex items-center justify-center">
                      <Coins className="w-5 h-5" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Interactive Trend Chart with Metric Switcher (Line Curve + Bars) */}
              <Card className="p-5 sm:p-6 border border-gray-200 shadow-xs space-y-4">
                {/* Header with Switcher Options */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" style={{ color: currentTrend.color }} />
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">
                        {currentTrend.title}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <TrendingUp className="w-3 h-3" />
                        {currentTrend.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {currentTrend.description}
                    </p>
                  </div>

                  {/* Metric Switcher Segmented Control */}
                  <div className="inline-flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200 shrink-0 self-start md:self-center">
                    <button
                      type="button"
                      onClick={() => setTrendMetric('volume')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        trendMetric === 'volume'
                          ? 'bg-white text-[#007979] shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      💰 Donations (৳)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrendMetric('campaigns')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        trendMetric === 'campaigns'
                          ? 'bg-white text-[#E37434] shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      🚀 Campaigns
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrendMetric('users')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        trendMetric === 'users'
                          ? 'bg-white text-[#2563EB] shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      👥 New Users
                    </button>
                  </div>
                </div>

                {/* Metric Summary Strip */}
                <div className="flex items-center gap-6 py-2 px-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 font-medium">{currentTrend.summaryLabel}: </span>
                    <strong className="text-gray-900 font-bold">{currentTrend.currentTotal}</strong>
                  </div>
                  <div className="hidden sm:block text-gray-300">•</div>
                  <div className="hidden sm:block">
                    <span className="text-gray-400 font-medium">Reporting Range: </span>
                    <strong className="text-gray-900 font-bold">Past 6 Months (Oct – Mar)</strong>
                  </div>
                </div>

                {/* SVG Visual Chart (Smooth Curve + Translucent Bars) */}
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[500px]">
                    <svg
                      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                      className="w-full h-56 sm:h-64 select-none"
                    >
                      <defs>
                        {/* Gradient for area under curve */}
                        <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={currentTrend.color} stopOpacity="0.22" />
                          <stop offset="100%" stopColor={currentTrend.color} stopOpacity="0.01" />
                        </linearGradient>

                        {/* Gradient for bars */}
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={currentTrend.lightColor} stopOpacity="0.85" />
                          <stop offset="100%" stopColor={currentTrend.color} stopOpacity="0.95" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Gridlines */}
                      <line x1={paddingLeft - 15} y1={paddingTop} x2={svgWidth - paddingRight + 15} y2={paddingTop} stroke="#F3F4F6" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1={paddingLeft - 15} y1={paddingTop + chartHeight / 2} x2={svgWidth - paddingRight + 15} y2={paddingTop + chartHeight / 2} stroke="#F3F4F6" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1={paddingLeft - 15} y1={paddingTop + chartHeight} x2={svgWidth - paddingRight + 15} y2={paddingTop + chartHeight} stroke="#E5E7EB" strokeWidth="1" />

                      {/* Y-Axis Value Labels */}
                      <text x={paddingLeft - 20} y={paddingTop + 4} textAnchor="end" fontSize="10" fontWeight="600" fill="#9CA3AF">
                        {currentTrend.formatShort(maxTrendVal)}
                      </text>
                      <text x={paddingLeft - 20} y={paddingTop + chartHeight / 2 + 3} textAnchor="end" fontSize="10" fontWeight="600" fill="#9CA3AF">
                        {currentTrend.formatShort(maxTrendVal / 2)}
                      </text>
                      <text x={paddingLeft - 20} y={paddingTop + chartHeight + 3} textAnchor="end" fontSize="10" fontWeight="600" fill="#9CA3AF">
                        0
                      </text>

                      {/* Bars for Each Month */}
                      {points.map((pt, i) => {
                        const barWidth = 32;
                        const barHeight = Math.max(8, paddingTop + chartHeight - pt.y);
                        const isLatest = i === points.length - 1;

                        return (
                          <g key={pt.month} className="group">
                            <rect
                              x={pt.x - barWidth / 2}
                              y={pt.y}
                              width={barWidth}
                              height={barHeight}
                              rx="6"
                              fill={isLatest ? 'url(#barGradient)' : currentTrend.lightColor}
                              fillOpacity={isLatest ? 1 : 0.45}
                              className="transition-all duration-300 hover:fill-opacity-90 cursor-pointer"
                            />
                            {/* Value label directly above bar */}
                            <text
                              x={pt.x}
                              y={pt.y - 7}
                              textAnchor="middle"
                              fontSize="11"
                              fontWeight="bold"
                              fill={isLatest ? currentTrend.color : '#4B5563'}
                            >
                              {currentTrend.formatShort(pt.val)}
                            </text>
                          </g>
                        );
                      })}

                      {/* Gradient Area Fill under Curve */}
                      <path d={areaPathD} fill="url(#curveGradient)" />

                      {/* Smooth Line Curve */}
                      <path
                        d={linePathD}
                        fill="none"
                        stroke={currentTrend.color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Data Point Circles on the Line */}
                      {points.map((pt, i) => {
                        const isLatest = i === points.length - 1;
                        return (
                          <g key={`dot-${pt.month}`}>
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={isLatest ? 6 : 4.5}
                              fill="#FFFFFF"
                              stroke={currentTrend.color}
                              strokeWidth={isLatest ? 3 : 2}
                            />
                            {/* Month Label on X-Axis */}
                            <text
                              x={pt.x}
                              y={svgHeight - 12}
                              textAnchor="middle"
                              fontSize="11"
                              fontWeight={isLatest ? 'bold' : '600'}
                              fill={isLatest ? currentTrend.color : '#6B7280'}
                            >
                              {pt.month}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              </Card>

              {/* Two-Column Breakdown: Categories & Academic Departments */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Category Distribution */}
                <Card className="p-5 border border-gray-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                      <Layers className="w-4.5 h-4.5 text-[#007979]" />
                      Campaigns by Category
                    </h3>
                    <span className="text-xs text-gray-500 font-semibold">
                      {campaigns.length} Initiatives
                    </span>
                  </div>
                  <div className="space-y-2.5">
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
                <Card className="p-5 border border-gray-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                      <Building2 className="w-4.5 h-4.5 text-[#E37434]" />
                      Campaigns by Department
                    </h3>
                    <span className="text-xs text-gray-500 font-semibold">
                      Academic Origin
                    </span>
                  </div>
                  <div className="space-y-2.5">
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
              <Card className="p-5 border border-gray-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4.5 h-4.5 text-[#007979]" />
                    <h3 className="text-sm sm:text-base font-bold text-gray-900">
                      Recent Administrative & Campus Activities
                    </h3>
                  </div>
                  <span className="text-xs text-gray-400">Live Audit Log</span>
                </div>

                <div className="divide-y divide-gray-100">
                  {(stats?.recentActivity || []).map((act) => (
                    <div key={act.id} className="py-2.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            act.type === 'report'
                              ? 'bg-red-50 text-red-600'
                              : act.type === 'expense'
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {act.type === 'report' ? (
                            <ShieldAlert className="w-3.5 h-3.5" />
                          ) : act.type === 'expense' ? (
                            <Receipt className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                            {act.title}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            By <span className="font-medium text-gray-700">{act.actor}</span> • {act.time}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
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
            <div className="space-y-4">
              {/* Status Sub-filter Pills */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('pending')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      statusFilter === 'all'
                        ? 'bg-[#007979] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All Campaigns ({campaigns.length})
                  </button>
                </div>

                <div className="text-xs text-gray-500 font-medium">
                  Showing <strong className="text-gray-900">{filteredCampaigns.length}</strong> campaigns
                </div>
              </div>

              {/* Search & Category Filter */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs">
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#24B1B1]"
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#24B1B1]"
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
                        className="p-4 sm:p-5 hover:shadow-md transition-shadow border border-gray-200"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Left: Thumbnail & Core Info */}
                          <div className="flex items-start gap-3.5 flex-1 min-w-0">
                            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                              <img
                                src={camp.image || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=300'}
                                alt={camp.title}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#007979]/10 text-[#007979]">
                                  {camp.category || 'Education'}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
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
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                    <FileText className="w-3 h-3" />
                                    {docs.length} Doc{docs.length > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>

                              <h3 className="text-base font-bold text-gray-900 leading-snug truncate">
                                {camp.title}
                              </h3>

                              <div className="flex flex-wrap items-center gap-2.5 text-xs text-gray-600">
                                <button
                                  type="button"
                                  onClick={() => handleOpenUserDossier(camp.creator_id)}
                                  className="inline-flex items-center gap-1 font-semibold text-gray-900 hover:text-[#007979] hover:underline cursor-pointer"
                                  title="Inspect creator dossier"
                                >
                                  <User className="w-3 h-3 text-[#007979]" />
                                  {camp.creator_name} ({camp.creator_user_type || 'Student'})
                                </button>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1 text-gray-600">
                                  <Building2 className="w-3 h-3 text-gray-400" />
                                  {camp.creator_department || camp.department}
                                </span>
                                <span>•</span>
                                <span className="font-bold text-[#E37434]">
                                  Goal: {formatCurrency(camp.goal_amount)}
                                </span>
                                <span>•</span>
                                <span className="text-gray-400">
                                  {formatDate(camp.created_at)}
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
                          <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
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
                                  className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center transition-colors cursor-pointer"
                                >
                                  <CheckCircle2 className="w-4.5 h-4.5" />
                                </button>
                                <button
                                  type="button"
                                  title="Reject"
                                  onClick={() => handleOpenReview(camp)}
                                  className="w-8 h-8 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer"
                                >
                                  <XCircle className="w-4.5 h-4.5" />
                                </button>
                              </>
                            )}

                            <button
                              type="button"
                              title="Remove Campaign from Platform"
                              onClick={() => handleDeleteCampaign(camp.id, camp.title)}
                              className="w-8 h-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
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
            <div className="space-y-4">
              {/* Sub-filters for Reports */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setReportStatusFilter('pending')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      reportStatusFilter === 'all'
                        ? 'bg-[#007979] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All Reports ({reports.length})
                  </button>
                </div>

                <div className="w-full sm:w-60">
                  <SearchBar
                    value={reportSearchQuery}
                    onChange={setReportSearchQuery}
                    placeholder="Search reports..."
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
                <div className="space-y-3">
                  {filteredReports.map((rep) => {
                    const isPending = (rep.status || 'pending') === 'pending';
                    return (
                      <Card
                        key={rep.id}
                        className={`p-5 border ${
                          isPending ? 'border-red-200 bg-red-50/20' : 'border-gray-200'
                        } space-y-3.5 shadow-xs`}
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-red-100 text-red-800 flex items-center gap-1">
                                <Flag className="w-3 h-3" />
                                {rep.reason}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
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
                                {formatDate(rep.created_at)}
                              </span>
                            </div>

                            <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                              Target Campaign:{' '}
                              <Link
                                to={`/campaigns/${rep.campaign_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#007979] hover:underline flex items-center gap-1"
                              >
                                {rep.campaign_title || `Campaign #${rep.campaign_id}`}
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            </h4>

                            <div className="p-3 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm text-gray-800 leading-relaxed shadow-2xs">
                              <p className="font-semibold text-[11px] text-gray-500 uppercase tracking-wider mb-0.5">
                                Complaint Details:
                              </p>
                              {rep.description}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 pt-0.5">
                              <span>
                                <strong className="text-gray-900">Reporter:</strong>{' '}
                                {rep.reporter_id ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenUserDossier(rep.reporter_id)}
                                    className="text-gray-900 hover:text-[#007979] hover:underline font-semibold cursor-pointer"
                                  >
                                    {rep.reporter_name || 'Anonymous'}
                                  </button>
                                ) : (
                                  rep.reporter_name || 'Anonymous'
                                )}{' '}
                                {rep.reporter_email && `(${rep.reporter_email})`}
                              </span>
                              <span>•</span>
                              <span>
                                <strong className="text-gray-900">Creator:</strong>{' '}
                                {rep.creator_id ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenUserDossier(rep.creator_id)}
                                    className="text-gray-900 hover:text-[#007979] hover:underline font-semibold cursor-pointer"
                                  >
                                    {rep.creator_name || 'Campus Creator'}
                                  </button>
                                ) : (
                                  rep.creator_name || 'Campus Creator'
                                )}
                              </span>
                              {rep.creator_status === 'deactivated' && (
                                <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">
                                  Creator Suspended
                                </span>
                              )}
                            </div>

                            {rep.admin_notes && (
                              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                                <strong className="font-bold">Investigation Findings: </strong>
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
                              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 border border-red-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer w-full"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Take Down Campaign</span>
                            </button>

                            {rep.creator_id && rep.creator_status !== 'deactivated' && (
                              <button
                                type="button"
                                onClick={() => handleDeactivateCreatorFromReport(rep.creator_id, rep.creator_name, rep.id)}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-red-50 hover:text-red-700 border border-gray-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer w-full"
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
            <div className="space-y-4">
              {/* Search & Filters for Users */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs">
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#24B1B1]"
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
              <Card className="p-5 border border-gray-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Campus User Directory & Access Control
                    </h3>
                    <p className="text-xs text-gray-500">
                      Deactivate disruptive users or reinstate restored campus members.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-gray-500">
                    {filteredUsers.length} account{filteredUsers.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <th className="pb-2.5">User & Email</th>
                        <th className="pb-2.5">Role & Dept</th>
                        <th className="pb-2.5">University ID</th>
                        <th className="pb-2.5">Status</th>
                        <th className="pb-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.map((u) => {
                        const isDeactivated = u.status === 'deactivated';
                        const isSelf = String(u.id) === String(currentUser?.id);

                        return (
                          <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-3 pr-4">
                              <button
                                type="button"
                                onClick={() => handleOpenUserDossier(u.id)}
                                className="font-bold text-gray-900 hover:text-[#007979] hover:underline text-left cursor-pointer flex items-center gap-1.5 group"
                                title="Click to view user profile dossier"
                              >
                                {u.name}
                                <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-[#007979] opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                              <p className="text-xs text-gray-500">{u.email}</p>
                            </td>
                            <td className="py-3 pr-4">
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-[#007979]/10 text-[#007979]">
                                {u.user_type || u.userType || 'Student'}
                              </span>
                              <p className="text-xs text-gray-600 mt-0.5">{u.department || 'General'}</p>
                            </td>
                            <td className="py-3 pr-4 font-mono text-xs text-gray-600">
                              {u.university_id || 'STU-2026'}
                            </td>
                            <td className="py-3 pr-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                                  isDeactivated
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {isDeactivated ? '✕ Suspended' : '✓ Active'}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenUserDossier(u.id)}
                                  icon={Eye}
                                  className="text-gray-700 border-gray-200 hover:bg-gray-100 text-xs py-1 px-2.5"
                                >
                                  Dossier
                                </Button>
                                {isSelf ? (
                                  <span className="text-xs text-gray-400 italic">Self</span>
                                ) : isDeactivated ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleToggleUserStatus(u.id, u.name, u.status)}
                                    icon={UserCheck}
                                    className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 text-xs py-1 px-2.5"
                                  >
                                    Reactivate
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleToggleUserStatus(u.id, u.name, u.status)}
                                    icon={UserX}
                                    className="text-red-600 border-red-200 hover:bg-red-50 text-xs py-1 px-2.5"
                                  >
                                    Deactivate
                                  </Button>
                                )}
                              </div>
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
          {/* MODULE: COMMENT MODERATION & PLATFORM DISCUSSION GOVERNANCE */}
          {/* ========================================================================= */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#007979]" />
                    Comment Moderation & Discourse Oversight
                  </h3>
                  <p className="text-xs text-gray-500">
                    Review, audit, or remove platform comments violating university conduct policies.
                  </p>
                </div>
                <div className="w-full sm:w-72">
                  <SearchBar
                    value={commentSearchQuery}
                    onChange={setCommentSearchQuery}
                    placeholder="Search comment, author, campaign..."
                  />
                </div>
              </div>

              {filteredComments.length === 0 ? (
                <EmptyState
                  title="No comments found"
                  description={
                    commentSearchQuery
                      ? 'No comments match your search filter criteria.'
                      : 'No comments have been posted across campaigns yet.'
                  }
                  actionLabel={commentSearchQuery ? 'Clear Search' : undefined}
                  onAction={commentSearchQuery ? () => setCommentSearchQuery('') : undefined}
                />
              ) : (
                <div className="space-y-3">
                  {filteredComments.map((cmt) => (
                    <Card
                      key={cmt.id}
                      className="p-5 border border-gray-200 hover:shadow-xs transition-shadow space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => handleOpenUserDossier(cmt.user_id)}
                            className="cursor-pointer group hover:opacity-90 transition-opacity shrink-0"
                            title="Inspect user profile dossier"
                          >
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#007979] to-[#24B1B1] text-white font-bold text-sm flex items-center justify-center shadow-2xs group-hover:ring-2 ring-[#24B1B1]">
                              {(cmt.user_name || 'U').charAt(0).toUpperCase()}
                            </div>
                          </button>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                type="button"
                                onClick={() => handleOpenUserDossier(cmt.user_id)}
                                className="font-bold text-sm text-gray-900 hover:text-[#007979] hover:underline cursor-pointer flex items-center gap-1"
                              >
                                {cmt.user_name || 'Campus Member'}
                                <ArrowUpRight className="w-3 h-3 text-gray-400" />
                              </button>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#007979]/10 text-[#007979]">
                                {cmt.user_type || 'Student'}
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">
                                {cmt.user_department || 'University Member'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>Posted on</span>
                              <Link
                                to={`/campaigns/${cmt.campaign_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-[#007979] hover:underline flex items-center gap-1"
                              >
                                {cmt.campaign_title || `Campaign #${cmt.campaign_id}`}
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                              <span>•</span>
                              <span>{formatDate(cmt.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenUserDossier(cmt.user_id)}
                            icon={Eye}
                            className="text-gray-700 border-gray-200 hover:bg-gray-100 text-xs py-1.5"
                          >
                            User Dossier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            loading={deletingCommentId === cmt.id}
                            onClick={() => handleDeleteComment(cmt.id)}
                            icon={Trash2}
                            className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs py-1.5"
                          >
                            Remove Comment
                          </Button>
                        </div>
                      </div>

                      <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                        "{cmt.content}"
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODULE 5: EXPENSE RECEIPTS AUDIT */}
          {/* ========================================================================= */}
          {activeTab === 'expenses' && (
            <div className="space-y-4">
              {/* Filter Pills */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setExpenseStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      expenseStatusFilter === 'verified'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Verified ({verifiedExpensesCount})
                  </button>
                </div>

                <div className="text-xs text-gray-500 font-medium">
                  Showing <strong className="text-gray-900">{filteredExpenses.length}</strong> receipts
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
                        className="p-4 sm:p-5 border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-start gap-3.5 flex-1 min-w-0">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                              {exp.receipt_url ? (
                                <img
                                  src={exp.receipt_url}
                                  alt={exp.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Receipt className="w-5 h-5" />
                                </div>
                              )}
                            </div>

                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#007979]/10 text-[#007979]">
                                  {exp.category || 'Expenditure'}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
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

                              <h4 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                                {exp.title}
                              </h4>

                              <p className="text-xs text-gray-600">
                                Campaign: <strong className="text-gray-900">{exp.campaign_title}</strong> • Vendor: {exp.vendor}
                              </p>

                              <div className="flex items-center gap-3 text-xs text-gray-500 pt-0.5">
                                <span className="font-bold text-[#E37434]">
                                  {formatCurrency(exp.amount)}
                                </span>
                                <span>•</span>
                                <span>{formatDate(exp.created_at)}</span>
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
                          <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                            {exp.receipt_url && (
                              <a
                                href={exp.receipt_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-[#007979] bg-[#007979]/10 hover:bg-[#007979]/20 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Invoice
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
                                Verify
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
            <div className="space-y-4">
              <Card className="p-5 border border-gray-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Master Campaign Directory & Permanent Removal
                    </h3>
                    <p className="text-xs text-gray-500">
                      Manage all approved, pending, and rejected campaigns with direct takedown capability.
                    </p>
                  </div>
                  <div className="w-full sm:w-60">
                    <SearchBar
                      value={campaignDirectorySearch}
                      onChange={setCampaignDirectorySearch}
                      placeholder="Search campaigns..."
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <th className="pb-2.5">Title & Category</th>
                        <th className="pb-2.5">Creator</th>
                        <th className="pb-2.5">Goal</th>
                        <th className="pb-2.5">Raised</th>
                        <th className="pb-2.5">Status</th>
                        <th className="pb-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredDirectoryCampaigns.map((camp) => (
                        <tr key={camp.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3 pr-4">
                            <p className="font-bold text-gray-900 line-clamp-1">{camp.title}</p>
                            <p className="text-xs text-[#007979]">{camp.category}</p>
                          </td>
                          <td className="py-3 pr-4">
                            <button
                              type="button"
                              onClick={() => handleOpenUserDossier(camp.creator_id)}
                              className="font-semibold text-gray-800 hover:text-[#007979] hover:underline text-left cursor-pointer flex items-center gap-1 group"
                              title="Click to view creator profile dossier"
                            >
                              {camp.creator_name}
                              <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-[#007979]" />
                            </button>
                            <p className="text-xs text-gray-500">{camp.creator_department}</p>
                          </td>
                          <td className="py-3 pr-4 font-semibold text-gray-700">
                            {formatCurrency(camp.goal_amount)}
                          </td>
                          <td className="py-3 pr-4 font-bold text-[#E37434]">
                            {formatCurrency(camp.amount_raised || 0)}
                          </td>
                          <td className="py-3 pr-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
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
                          <td className="py-3 text-right space-x-2">
                            <Link
                              to={`/campaigns/${camp.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#007979] bg-teal-50 hover:bg-teal-100 transition-colors"
                              title="View Public Campaign Page as normal user"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Public View</span>
                            </Link>
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

      {/* User Profile Dossier Inspection Modal */}
      <UserProfileDossierModal
        userId={dossierUserId}
        isOpen={isDossierOpen}
        onClose={() => {
          setIsDossierOpen(false);
          setDossierUserId(null);
        }}
      />
    </div>
  );
}
