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
} from 'lucide-react';

export default function AdminDashboardPage() {
  // Main Tab State: 'queue' | 'expenses' | 'analytics'
  const [activeTab, setActiveTab] = useState('queue');

  // Loading States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionProcessing, setActionProcessing] = useState(false);

  // Data States
  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Queue Filter States
  const [statusFilter, setStatusFilter] = useState('pending'); // 'pending' | 'approved' | 'rejected' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  // Expense Filter States
  const [expenseStatusFilter, setExpenseStatusFilter] = useState('all');

  // Selected Campaign for Document Modal
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Expense Action Modal State
  const [expenseNoteModal, setExpenseNoteModal] = useState({
    isOpen: false,
    expenseId: null,
    action: 'verified', // 'verified' | 'rejected'
    notes: '',
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsData, campaignsData, expensesData] = await Promise.all([
        adminService.getStats(),
        adminService.getCampaigns({ status: 'all' }),
        adminService.getExpenses({ status: 'all' }),
      ]);
      setStats(statsData);
      setCampaigns(campaignsData);
      setExpenses(expensesData);
    } catch (err) {
      toast.error(err.message || 'Failed to load administrative data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const [statsData, campaignsData, expensesData] = await Promise.all([
        adminService.getStats(),
        adminService.getCampaigns({ status: 'all' }),
        adminService.getExpenses({ status: 'all' }),
      ]);
      setStats(statsData);
      setCampaigns(campaignsData);
      setExpenses(expensesData);
      toast.success('Data refreshed successfully');
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
    if (!window.confirm(`Are you sure you want to remove the campaign "${title}" from the university platform?`)) {
      return;
    }
    setActionProcessing(true);
    try {
      await adminService.deleteCampaign(id);
      toast.success('Campaign removed from platform');
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
      setExpenseNoteModal({ isOpen: false, expenseId: null, action: 'verified', notes: '' });
      await loadAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to update expense status');
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

  // Filtered Expenses
  const filteredExpenses = expenses.filter((e) => {
    if (expenseStatusFilter === 'all') return true;
    return e.status === expenseStatusFilter;
  });

  // Count helper
  const pendingCampaignsCount = campaigns.filter((c) => (c.status || 'pending') === 'pending').length;
  const approvedCampaignsCount = campaigns.filter((c) => c.status === 'approved').length;
  const rejectedCampaignsCount = campaigns.filter((c) => c.status === 'rejected').length;
  const pendingExpensesCount = expenses.filter((e) => e.status === 'pending').length;

  if (loading) {
    return <Loader text="Loading University Administration Hub..." />;
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <PageHeader
        title="University Verification & Moderation Hub"
        description="Official university administration gateway to verify campaigns, review legal/academic documentation, and audit financial transparency."
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

      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Pending Queue */}
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
                Requires Admin Clearance
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Metric 2: Active Public Campaigns */}
        <Card className="p-5 border-l-4 border-l-[#007979] bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Approved & Active
              </p>
              <h3 className="text-3xl font-extrabold text-[#007979] mt-1">
                {stats?.campaigns?.approved ?? approvedCampaignsCount}
              </h3>
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                Live for Public Donors
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#007979]/10 text-[#007979] flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Metric 3: Total Funds Raised */}
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
                Goal: {formatCurrency(stats?.campaigns?.totalGoal ?? 0)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#E37434]/10 text-[#E37434] flex items-center justify-center">
              <Coins className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Metric 4: Expenses Audited */}
        <Card className="p-5 border-l-4 border-l-blue-500 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Expenses Audited
              </p>
              <h3 className="text-3xl font-extrabold text-gray-900 mt-1">
                {stats?.expenses?.verified ?? 0}
              </h3>
              <p className="text-xs text-blue-600 font-semibold mt-1">
                {stats?.expenses?.pending ?? pendingExpensesCount} Pending Audit
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'queue'
              ? 'border-[#007979] text-[#007979]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ShieldCheck className="w-4.5 h-4.5" />
          <span>Document-Verification Queue</span>
          {pendingCampaignsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800">
              {pendingCampaignsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'expenses'
              ? 'border-[#007979] text-[#007979]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Receipt className="w-4.5 h-4.5" />
          <span>Expense Receipts & Transparency</span>
          {pendingExpensesCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800">
              {pendingExpensesCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'analytics'
              ? 'border-[#007979] text-[#007979]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <BarChart3 className="w-4.5 h-4.5" />
          <span>Platform Moderation & Analytics</span>
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

            {/* Quick Summary Pill */}
            <div className="text-xs text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-900">{filteredCampaigns.length}</span> campaigns
            </div>
          </div>

          {/* Search and Category Filters */}
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

          {/* Verification Queue Campaign Cards / Table */}
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
                                {docs.length} Doc{docs.length > 1 ? 's' : ''} Attached
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

                          {/* Rejection / Approval Note if exists */}
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
                              title="Quick Reject"
                              onClick={() => handleOpenReview(camp)}
                              className="w-9 h-9 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          title="Remove Campaign"
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
      {/* TAB 2: EXPENSE RECEIPTS & TRANSPARENCY AUDIT */}
      {/* ========================================================================= */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          {/* Status Sub-filter */}
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
                Flagged / Rejected ({expenses.filter((e) => e.status === 'rejected').length})
              </button>
            </div>
            <p className="text-xs text-gray-500 font-medium hidden sm:block">
              Ensures donors see verified financial utilization receipts.
            </p>
          </div>

          {/* Expense Receipts List */}
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

                      {/* Right Action: Preview & Verify */}
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
      {/* TAB 3: PLATFORM MODERATION & ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Distribution Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
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

            {/* Department Breakdown */}
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

          {/* Master Moderation Table */}
          <Card className="p-6 border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Platform Moderation & Status Management
                </h3>
                <p className="text-xs text-gray-500">
                  Full list of all campaigns with instant moderation and deletion powers.
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
                    <th className="pb-3 text-right">Moderation</th>
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
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer inline-flex items-center"
                          title="Delete Campaign"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Document Verification Inspection Modal */}
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
