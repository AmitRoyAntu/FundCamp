import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { campaignService } from '../../services/campaignService';
import { profileService } from '../../services/profileService';
import PageHeader from '../../components/common/PageHeader';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Dropdown from '../../components/common/Dropdown';
import CampaignCard from '../../components/campaign/CampaignCard';
import EmptyState from '../../components/common/EmptyState';
import { ProfileSkeleton, CampaignSkeleton } from '../../components/common/Skeleton';
import { DEPARTMENTS } from '../../constants/userTypes';
import { MALE_AVATAR, FEMALE_AVATAR } from '../../constants/avatars';
import { formatCurrency, calculatePercentage, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  IdCard,
  Building2,
  GraduationCap,
  Edit3,
  Calendar,
  Sparkles,
  PlusCircle,
  FolderHeart,
  TrendingUp,
  Users,
  Heart,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Receipt,
  BarChart3,
  Megaphone,
  Camera,
  Upload,
  Trash2,
  Check,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function ProfilePage() {
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Active Tab: 'analytics' | 'contributions' | 'campaigns' | 'saved'
  const [activeTab, setActiveTab] = useState('analytics');

  const [analytics, setAnalytics] = useState(null);
  const [contributionsData, setContributionsData] = useState(null);
  const [userCampaigns, setUserCampaigns] = useState([]);
  const [savedCampaigns, setSavedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Profile Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editData, setEditData] = useState({
    fullName: '',
    department: '',
    universityId: '',
    avatar: '',
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      setEditData({
        fullName: currentUser.fullName || '',
        department: currentUser.department || '',
        universityId: currentUser.universityId || '',
        avatar: currentUser.avatar || '',
      });
      loadProfileData();
    }
  }, [currentUser]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size cannot be larger than 10MB. Please choose a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target.result;
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 400;
        let width = img.width;
        let height = img.height;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const compressed = canvas.toDataURL(mimeType, 0.9);
        setEditData((prev) => ({ ...prev, avatar: compressed }));
        toast.success('Photo preview ready. Click "Save Changes" to update!');
      };
      img.onerror = () => {
        setEditData((prev) => ({ ...prev, avatar: rawDataUrl }));
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const loadProfileData = async () => {
    setLoading(true);
    try {
  const [analyticsRes, contributionsRes, campaignsRes, savedCampaignsRes] = await Promise.all([
  profileService.getCreatorAnalytics(),
  profileService.getUserContributions(),
  campaignService.getUserCampaigns(currentUser),
  profileService.getSavedCampaigns(),
]);

setAnalytics(analyticsRes);
setContributionsData(contributionsRes);
setUserCampaigns(campaignsRes || []);
setSavedCampaigns(savedCampaignsRes || []);
    } catch (err) {
      console.error('Error loading profile dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await updateProfile(editData);
      toast.success('Profile updated successfully!');
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  if (!currentUser) return null;

  const totalContributed = contributionsData?.totalContributed || 0;
  const uniqueBackedCount = contributionsData?.uniqueCampaignsCount || 0;
  const contributionsList = contributionsData?.contributions || [];

  const totalRaised = analytics?.totalRaised || 0;
  const totalGoal = analytics?.totalGoal || 1;
  const totalBackers = analytics?.totalBackers || 0;
  const recentDonations = analytics?.recentDonations || [];
  const fundingTimeline = analytics?.fundingTimeline || [];
  const overallPercentage = calculatePercentage(totalRaised, totalGoal);

  const isAdmin = currentUser?.userType === 'Admin' || currentUser?.user_type === 'Admin';

  return (
    <div className="space-y-8 pb-16 max-w-[1280px] mx-auto">
      <PageHeader
        title={isAdmin ? "Administrator Profile & Workspace" : "Creator Dashboard & Profile"}
        description={isAdmin ? "University administration identity, platform privileges, and moderation access." : "Monitor your fundraising metrics, backer contributions, and university identity."}
      >
        <div className="flex items-center gap-2.5">
          {isAdmin && (
            <Button
              variant="primary"
              onClick={() => navigate('/admin')}
              icon={ShieldCheck}
            >
              Admin Portal
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setIsModalOpen(true)}
            icon={Edit3}
          >
            Edit Profile
          </Button>
          <Button
            variant="cta"
            onClick={() => navigate('/create')}
            icon={PlusCircle}
          >
            New Campaign
          </Button>
        </div>
      </PageHeader>

      {/* Main Profile Identity Card */}
      <Card className="p-6 sm:p-8 shadow-sm border border-[#E5E7EB] relative overflow-hidden bg-gradient-to-r from-white via-white to-[#FFFDF8]">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div
            className="relative group cursor-pointer shrink-0"
            onClick={() => setIsModalOpen(true)}
            title="Click to edit profile & photo"
          >
            <Avatar
              src={currentUser.avatar}
              name={currentUser.fullName}
              size="xl"
              className="ring-2 ring-gray-200 shadow-xs transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-xs">
              <Camera className="w-6 h-6" />
            </div>
          </div>

          <div className="space-y-3 text-center md:text-left flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-bold text-[#1F2937] truncate">{currentUser.fullName}</h2>
                <p className="text-sm text-[#6B7280]">{currentUser.email}</p>
              </div>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold self-center md:self-start ${
                isAdmin
                  ? 'bg-[#007979] text-white shadow-xs'
                  : 'bg-[#FFE2AF] text-[#8C5B00]'
              }`}>
                {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
                {currentUser.userType}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#E5E7EB] text-sm text-[#1F2937]">
              <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-[#E5E7EB]">
                <IdCard className="w-4 h-4 text-[#007979] shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-[#6B7280]">University ID</p>
                  <p className="font-semibold text-xs truncate">{currentUser.universityId || (isAdmin ? 'ADM-2026-001' : 'STU-2026-08')}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-[#E5E7EB]">
                <Building2 className="w-4 h-4 text-[#007979] shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-[#6B7280]">Department</p>
                  <p className="font-semibold text-xs truncate">{currentUser.department || 'University Department'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-[#E5E7EB]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-[#6B7280]">Verification</p>
                  <p className="font-semibold text-xs text-emerald-700">{isAdmin ? 'Authorized Administrator' : 'Verified Member'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Administrator Portal Callout Banner */}
      {isAdmin && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#007979]/10 border border-[#007979]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#007979] text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1F2937]">University Administrator Clearance Active</h3>
              <p className="text-xs text-[#6B7280]">
                You have administrative clearance to review verification documents, audit expense receipts, manage user status, and moderate campaigns.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/admin')}
            icon={ArrowUpRight}
            className="shrink-0 w-full sm:w-auto"
          >
            Open Admin Portal
          </Button>
        </div>
      )}

      {/* Navigation Tab Bar */}
      <div className="flex border-b border-[#E5E7EB] space-x-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3.5 text-sm sm:text-base font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-[#007979] text-[#007979]'
              : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Creator Analytics & Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('contributions')}
          className={`pb-3.5 text-sm sm:text-base font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'contributions'
              ? 'border-[#007979] text-[#007979]'
              : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>My Backed Projects</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${
              activeTab === 'contributions' ? 'bg-[#007979] text-white' : 'bg-gray-100 text-[#6B7280]'
            }`}
          >
            {contributionsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('campaigns')}
          className={`pb-3.5 text-sm sm:text-base font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'campaigns'
              ? 'border-[#007979] text-[#007979]'
              : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
          }`}
        >
          <FolderHeart className="w-4 h-4" />
          <span>My Created Campaigns</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${
              activeTab === 'campaigns' ? 'bg-[#007979] text-white' : 'bg-gray-100 text-[#6B7280]'
            }`}
          >
            {userCampaigns.length}
          </span>
        </button>
	<button
          onClick={() => setActiveTab('saved')}
          className={`pb-3.5 text-sm sm:text-base font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'saved'
              ? 'border-[#007979] text-[#007979]'
              : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
          }`}
        >
          <span>🔖</span>
          <span>Saved Campaigns</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${
              activeTab === 'saved' ? 'bg-[#007979] text-white' : 'bg-gray-100 text-[#6B7280]'
            }`}
          >
            {savedCampaigns.length}
          </span>
        </button>
      </div>

      {/* TAB 1: CREATOR ANALYTICS & DASHBOARD */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Creator Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card hoverable={false} className="p-5 border border-[#E5E7EB] space-y-2 bg-[#FFFDF8]">
              <div className="flex items-center justify-between text-xs font-semibold text-[#8C5B00]">
                <span>Total Raised</span>
                <span className="p-1.5 rounded-lg bg-[#FFE2AF] text-[#8C5B00]">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#1F2937]">
                {formatCurrency(totalRaised)}
              </p>
              <p className="text-xs text-[#6B7280]">
                Across {userCampaigns.length} created campaigns
              </p>
            </Card>

            <Card hoverable={false} className="p-5 border border-[#E5E7EB] space-y-2 bg-white">
              <div className="flex items-center justify-between text-xs font-semibold text-[#007979]">
                <span>Total Backers</span>
                <span className="p-1.5 rounded-lg bg-[#007979]/10 text-[#007979]">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#1F2937]">
                {totalBackers}
              </p>
              <p className="text-xs text-[#6B7280]">
                Community supporters & alumni
              </p>
            </Card>

            <Card hoverable={false} className="p-5 border border-[#E5E7EB] space-y-2 bg-white">
              <div className="flex items-center justify-between text-xs font-semibold text-teal-700">
                <span>Goal Funded Rate</span>
                <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#24B1B1]">
                {overallPercentage}%
              </p>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-[#24B1B1] h-full rounded-full"
                  style={{ width: `${Math.min(overallPercentage, 100)}%` }}
                />
              </div>
            </Card>

            <Card hoverable={false} className="p-5 border border-[#E5E7EB] space-y-2 bg-white">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-700">
                <span>Active Campaigns</span>
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                  <Megaphone className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#1F2937]">
                {userCampaigns.length}
              </p>
              <p className="text-xs text-[#6B7280]">
                Published research & projects
              </p>
            </Card>
          </div>

          {/* Real-Time Funding Graph / Daily Activity & Recent Donor Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Funding Timeline Graph Card (2 cols) */}
            <Card hoverable={false} className="lg:col-span-2 p-6 border border-[#E5E7EB] space-y-5 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#1F2937] flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#007979]" /> Real-Time Funding Timeline
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    Daily contribution influx across your university initiatives
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#007979]/10 text-[#007979]">
                  Live Synchronized
                </span>
              </div>

              {fundingTimeline.length === 0 ? (
                <div className="h-56 flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <BarChart3 className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500 font-medium">
                    No timeline data recorded yet. Contributions will populate this real-time chart.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="h-52 flex items-end gap-3 pt-6 pb-2 px-2 overflow-x-auto">
                    {fundingTimeline.map((item, idx) => {
                      const maxAmt = Math.max(...fundingTimeline.map(t => t.amount), 1000);
                      const heightPercent = Math.max((item.amount / maxAmt) * 100, 15);
                      return (
                        <div key={idx} className="flex-1 min-w-[50px] flex flex-col items-center gap-2 h-full justify-end group">
                          <div className="text-[10px] font-extrabold text-[#007979] opacity-0 group-hover:opacity-100 transition-opacity">
                            {formatCurrency(item.amount)}
                          </div>
                          <div
                            className="w-full max-w-[40px] bg-gradient-to-t from-[#007979] to-[#24B1B1] rounded-t-xl transition-all duration-500 hover:brightness-110 shadow-xs cursor-pointer"
                            style={{ height: `${heightPercent}%` }}
                            title={`${item.date}: ${formatCurrency(item.amount)}`}
                          />
                          <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                            {item.date.slice(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <span>Showing daily recorded backer contributions</span>
                    <span className="font-bold text-[#007979]">Total: {formatCurrency(totalRaised)}</span>
                  </div>
                </div>
              )}
            </Card>

            {/* Live Backer Stream (1 col) */}
            <Card hoverable={false} className="p-6 border border-[#E5E7EB] space-y-4 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#1F2937] flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#E37434]" /> Recent Backer Stream
                </h3>
                <span className="text-xs text-[#6B7280] font-semibold">{recentDonations.length} records</span>
              </div>

              {recentDonations.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-500">
                  No backer contributions recorded yet.
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {recentDonations.map((don, idx) => (
                    <div
                      key={don.id || idx}
                      className="p-3 rounded-xl border border-gray-100 bg-[#FFFDF8] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-[#1F2937] truncate">{don.donor_name || 'Anonymous Backer'}</p>
                        <p className="text-[10px] text-gray-500 truncate">{don.campaign_title}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-[#007979]">
                          {formatCurrency(don.amount)}
                        </span>
                        <p className="text-[10px] text-gray-400">{don.payment_method || 'bKash'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: MY CONTRIBUTIONS (BACKER IMPACT HISTORY) */}
      {activeTab === 'contributions' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Total Impact Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#007979] to-[#24B1B1] text-white shadow-md space-y-4 relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-white/20 text-white backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Backer Impact Record
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold">
                You have supported {uniqueBackedCount} university initiatives totaling {formatCurrency(totalContributed)}!
              </h3>
              <p className="text-sm text-teal-100 max-w-2xl">
                Your direct backing empowers university students, laboratory research, and campus community projects.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-10 pointer-events-none">
              <Heart className="w-80 h-80 text-white" />
            </div>
          </div>

          {/* Contributions List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1F2937]">Contribution History</h3>
              <span className="text-xs text-[#6B7280] font-semibold">{contributionsList.length} total contributions</span>
            </div>

            {contributionsList.length === 0 ? (
              <EmptyState
                variant="profile"
                title="No project contributions yet"
                description="You haven't backed any campus campaigns yet. Discover inspiring research and student initiatives to support!"
                actionText="Explore Campus Campaigns"
                onAction={() => navigate('/dashboard')}
              />
            ) : (
              <div className="space-y-4">
                {contributionsList.map((item, idx) => {
                  const percent = calculatePercentage(item.amount_raised || 0, item.goal_amount || 1);
                  return (
                    <Card
                      key={item.id || idx}
                      hoverable={false}
                      className="p-5 sm:p-6 border border-[#E5E7EB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 bg-white transition-all hover:shadow-xs"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        {/* Campaign Cover Thumbnail */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                          <img
                            src={item.campaign_image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=300'}
                            alt={item.campaign_title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Campaign Information */}
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#007979]/10 text-[#007979]">
                              {item.campaign_category || 'Academic'}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              Backed on {formatDate(item.created_at)}
                            </span>
                          </div>

                          <h4 className="font-bold text-base text-[#1F2937] truncate">
                            {item.campaign_title}
                          </h4>

                          <p className="text-xs text-gray-500 truncate">
                            Led by {item.creator_name} • {item.creator_department}
                          </p>

                          {/* Mini Progress */}
                          <div className="flex items-center gap-3 pt-1 max-w-xs">
                            <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-[#24B1B1] h-full rounded-full"
                                style={{ width: `${Math.min(percent, 100)}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-semibold text-[#24B1B1]">{percent}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Contribution Amount & Action */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 gap-3 shrink-0">
                        <div className="text-left sm:text-right">
                          <span className="text-lg sm:text-xl font-extrabold text-[#007979]">
                            {formatCurrency(item.amount)}
                          </span>
                          <p className="text-[11px] text-gray-500">
                            via <strong className="text-gray-700">{item.payment_method || 'bKash'}</strong>
                          </p>
                        </div>

                        <Link to={`/campaign/${item.campaign_id}`}>
                          <Button variant="outline" size="sm" icon={ExternalLink}>
                            View Project
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MY CREATED CAMPAIGNS */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#1F2937]">My Created Campaigns</h3>
              <p className="text-sm text-[#6B7280]">Fundraising initiatives published under your account</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/create')}
              icon={PlusCircle}
            >
              New Campaign
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <CampaignSkeleton />
              <CampaignSkeleton />
            </div>
          ) : userCampaigns.length === 0 ? (
            <EmptyState
              variant="profile"
              title="No campaigns published yet"
              description="You haven't created any campaigns. Share your research or campus project idea with the university community!"
              actionText="Start a Campaign"
              onAction={() => navigate('/create')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
	      {/* TAB 4: SAVED CAMPAIGNS */}
      {activeTab === 'saved' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-xl font-bold text-[#1F2937]">Saved Campaigns</h3>
            <p className="text-sm text-[#6B7280]">
              Campaigns you've bookmarked for later
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <CampaignSkeleton />
              <CampaignSkeleton />
            </div>
          ) : savedCampaigns.length === 0 ? (
            <EmptyState
              variant="profile"
              title="No saved campaigns"
              description="You haven't saved any campaigns yet. Browse campaigns and bookmark the ones you'd like to revisit."
              actionText="Browse Campaigns"
              onAction={() => navigate('/dashboard')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Profile Information"
      >
        <form onSubmit={handleEditSubmit} className="space-y-5">
          {/* Profile Photo Uploader */}
          <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200 space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-800">
                Profile Photo
              </label>
              <span className="text-[11px] text-gray-500">Max 10MB</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div
                className="relative group cursor-pointer shrink-0"
                onClick={() => fileInputRef.current?.click()}
                title="Click to browse image"
              >
                <Avatar
                  src={editData.avatar || currentUser.avatar}
                  name={editData.fullName || currentUser.fullName}
                  size="lg"
                  className="ring-2 ring-gray-200 shadow-xs"
                />
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-2xs">
                  <Camera className="w-5 h-5" />
                </div>
              </div>

              {/* Primary: Upload Button & File Info */}
              <div className="space-y-3 flex-1 min-w-0 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-xs font-semibold text-gray-800 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-gray-600" /> Choose Photo
                  </button>
                </div>

                <p className="text-[11px] text-gray-500">
                  Supports PNG, JPG, WebP • File size cannot be larger than 10MB
                </p>

                {/* Secondary Option: Just the Male & Female Logo Icons (No Titles) */}
                <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-2 border-t border-gray-200/80">
                  <span className="text-[11px] text-gray-500 font-medium">Or choose avatar:</span>
                  <div className="flex items-center gap-2">
                    {/* Male Logo Thumbnail Only */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditData((prev) => ({ ...prev, avatar: MALE_AVATAR }));
                        toast.success('Selected Male avatar logo!');
                      }}
                      title="Male Avatar"
                      className={`relative p-0.5 rounded-full transition-all cursor-pointer ${
                        editData.avatar === MALE_AVATAR
                          ? 'ring-2 ring-gray-900 scale-110 shadow-xs'
                          : 'opacity-60 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      <img src={MALE_AVATAR} alt="Male Avatar" className="w-7 h-7 rounded-full object-cover" />
                    </button>

                    {/* Female Logo Thumbnail Only */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditData((prev) => ({ ...prev, avatar: FEMALE_AVATAR }));
                        toast.success('Selected Female avatar logo!');
                      }}
                      title="Female Avatar"
                      className={`relative p-0.5 rounded-full transition-all cursor-pointer ${
                        editData.avatar === FEMALE_AVATAR
                          ? 'ring-2 ring-gray-900 scale-110 shadow-xs'
                          : 'opacity-60 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      <img src={FEMALE_AVATAR} alt="Female Avatar" className="w-7 h-7 rounded-full object-cover" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Input
            label="Full Name"
            value={editData.fullName}
            onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
            icon={User}
            required
          />

          <Input
            label="University ID"
            value={editData.universityId}
            onChange={(e) => setEditData({ ...editData, universityId: e.target.value })}
            icon={IdCard}
            required
          />

          <Dropdown
            label="Department"
            value={editData.department}
            onChange={(e) => setEditData({ ...editData, department: e.target.value })}
            options={DEPARTMENTS}
            icon={Building2}
            placeholder=""
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={editLoading}
              icon={Sparkles}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
