import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { campaignService } from '../../services/campaignService';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import Input from '../../components/common/Input';
import { formatCurrency, calculatePercentage, formatDate, daysLeft } from '../../utils/formatters';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Share2,
  Heart,
  GraduationCap,
  Building2,
  Calendar,
  Target,
  CheckCircle2,
  Info,
  ShieldCheck,
  AlertCircle,
  Clock,
  MessageSquare,
  Megaphone,
  Plus,
  Send,
  UserCheck,
} from 'lucide-react';

export default function CampaignDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();

  const [campaign, setCampaign] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab State: 'campaign' | 'updates' | 'comments'
  const [activeTab, setActiveTab] = useState('campaign');

  // Form states
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [postingUpdate, setPostingUpdate] = useState(false);

  const [commentContent, setCommentContent] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    const fetchDetailAndData = async () => {
      setLoading(true);
      try {
        const [campData, updatesData, commentsData] = await Promise.all([
          campaignService.getCampaignById(id),
          campaignService.getCampaignUpdates(id),
          campaignService.getCampaignComments(id),
        ]);
        setCampaign(campData);
        setUpdates(updatesData || []);
        setComments(commentsData || []);
      } catch (err) {
        setError(err.message || 'Failed to load campaign details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetailAndData();
  }, [id]);

  const isCreator =
    currentUser &&
    campaign &&
    (String(currentUser.id) === String(campaign.creator_id) ||
      currentUser.fullName?.toLowerCase() === campaign.creator?.name?.toLowerCase());

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Campaign link copied to clipboard!');
  };

  const handleDonateClick = () => {
    toast.error('Payment gateway integration will be available in the upcoming production release!', {
      icon: '💳',
      duration: 4000,
    });
  };

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    if (!updateTitle.trim() || !updateContent.trim()) {
      toast.error('Please fill in both title and update content');
      return;
    }

    setPostingUpdate(true);
    try {
      const newUpdate = await campaignService.createCampaignUpdate(id, {
        title: updateTitle.trim(),
        content: updateContent.trim(),
      });
      setUpdates([newUpdate, ...updates]);
      setUpdateTitle('');
      setUpdateContent('');
      setShowUpdateForm(false);
      toast.success('Campaign update published successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to post update');
    } finally {
      setPostingUpdate(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) {
      toast.error('Please write a comment before submitting');
      return;
    }

    setPostingComment(true);
    try {
      const newComment = await campaignService.createCampaignComment(id, {
        content: commentContent.trim(),
      });
      setComments([newComment, ...comments]);
      setCommentContent('');
      toast.success('Comment posted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to post comment');
    } finally {
      setPostingComment(false);
    }
  };

  if (loading) return <Loader text="Loading campaign details..." />;

  if (error || !campaign) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#1F2937]">Campaign Not Found</h2>
        <p className="text-sm text-[#6B7280]">The campaign you are looking for does not exist or has been removed.</p>
        <Button variant="primary" onClick={() => navigate('/dashboard')} icon={ArrowLeft}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const {
    title,
    description,
    category,
    goalAmount,
    amountRaised,
    creator,
    department,
    createdAt,
    status,
    image,
    story,
    objectives,
  } = campaign;

  const percentage = calculatePercentage(amountRaised, goalAmount);
  const remainingDays = daysLeft(createdAt);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#007979] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to campaigns
        </button>
        <Button variant="outline" size="sm" onClick={handleShare} icon={Share2}>
          Share Link
        </Button>
      </div>

      {/* Main Campaign Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Banner Image & Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative w-full h-[320px] sm:h-[400px] rounded-3xl overflow-hidden border border-[#E5E7EB] bg-gray-100 shadow-sm">
            <img src={image} alt={title} className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-[#007979] shadow-xs">
                {category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFE2AF] text-[#8C5B00] shadow-xs">
                {status === 'completed' ? 'Funded' : 'Active Campaign'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1F2937] leading-tight">
              {title}
            </h1>
            <p className="text-base sm:text-lg text-[#6B7280] leading-relaxed">
              {description}
            </p>
          </div>

          {/* Creator Profile Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <Avatar src={creator?.avatar} name={creator?.name} size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-[#1F2937] text-base">{creator?.name}</p>
                  {isCreator && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#007979]/10 text-[#007979]">
                      You (Creator)
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7280] mt-0.5">
                  <span className="inline-flex items-center gap-1 font-semibold text-[#007979]">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {creator?.userType}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {department}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280] mt-1">ID: {creator?.universityId}</p>
              </div>
            </div>

            <div className="text-xs text-[#6B7280] flex items-center gap-1 self-start sm:self-auto bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
              <Calendar className="w-3.5 h-3.5 text-[#007979]" />
              <span>Created {formatDate(createdAt)}</span>
            </div>
          </div>

          {/* Kickstarter-Style Tab Navigation */}
          <div className="border-b border-[#E5E7EB] bg-white sticky top-16 z-30 pt-2 shadow-xs rounded-t-2xl px-2">
            <div className="flex gap-6 sm:gap-10 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab('campaign')}
                className={`pb-3.5 text-sm sm:text-base font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'campaign'
                    ? 'border-[#007979] text-[#007979]'
                    : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
                }`}
              >
                Campaign
              </button>

              <button
                onClick={() => setActiveTab('updates')}
                className={`pb-3.5 text-sm sm:text-base font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'updates'
                    ? 'border-[#007979] text-[#007979]'
                    : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
                }`}
              >
                <span>Updates</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${
                    activeTab === 'updates' ? 'bg-[#007979] text-white' : 'bg-gray-100 text-[#6B7280]'
                  }`}
                >
                  {updates.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('comments')}
                className={`pb-3.5 text-sm sm:text-base font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'comments'
                    ? 'border-[#007979] text-[#007979]'
                    : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
                }`}
              >
                <span>Comments</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${
                    activeTab === 'comments' ? 'bg-[#007979] text-white' : 'bg-gray-100 text-[#6B7280]'
                  }`}
                >
                  {comments.length}
                </span>
              </button>
            </div>
          </div>

          {/* TAB 1: CAMPAIGN STORY */}
          {activeTab === 'campaign' && (
            <Card hoverable={false} className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-[#1F2937]">About This Initiative</h3>
                <p className="text-sm sm:text-base text-[#1F2937] leading-relaxed whitespace-pre-line">
                  {story || description}
                </p>
              </div>

              {objectives && objectives.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[#E5E7EB]">
                  <h4 className="text-base font-bold text-[#1F2937] flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#007979]" /> Key Project Objectives
                  </h4>
                  <ul className="space-y-2">
                    {objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-[#6B7280]">
                        <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )}

          {/* TAB 2: UPDATES */}
          {activeTab === 'updates' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Creator Post Update Action Box */}
              {isCreator && (
                <div className="bg-[#FFFDF8] border border-[#FFE2AF] rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#8C5B00] font-bold text-sm">
                      <Megaphone className="w-4 h-4 text-[#E37434]" />
                      <span>Post a Campaign Update</span>
                    </div>
                    <Button
                      variant={showUpdateForm ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => setShowUpdateForm(!showUpdateForm)}
                      icon={showUpdateForm ? undefined : Plus}
                    >
                      {showUpdateForm ? 'Cancel' : 'New Update'}
                    </Button>
                  </div>

                  {showUpdateForm && (
                    <form onSubmit={handlePostUpdate} className="space-y-4 pt-3 border-t border-[#FFE2AF]/60">
                      <div>
                        <label className="block text-xs font-semibold text-[#1F2937] mb-1">
                          Update Title
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Milestone 1 Reached: Lab Equipment Acquired!"
                          value={updateTitle}
                          onChange={(e) => setUpdateTitle(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#007979]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1F2937] mb-1">
                          Update Content
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Provide details about your project progress, prototype testing, or budget allocations..."
                          value={updateContent}
                          onChange={(e) => setUpdateContent(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#007979]"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        variant="cta"
                        size="md"
                        isLoading={postingUpdate}
                        icon={Send}
                      >
                        Publish Update
                      </Button>
                    </form>
                  )}
                </div>
              )}

              {/* Updates List */}
              {updates.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-[#E5E7EB] space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#007979] flex items-center justify-center mx-auto">
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-[#1F2937]">No updates posted yet</h4>
                  <p className="text-xs text-[#6B7280]">
                    The campaign creator hasn't posted any updates yet. Check back soon for project milestones.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {updates.map((upd, idx) => (
                    <Card key={upd.id || idx} hoverable={false} className="p-6 space-y-3 border border-[#E5E7EB]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#007979]/10 text-[#007979]">
                            Update #{updates.length - idx}
                          </span>
                          <span className="text-xs text-[#6B7280] font-medium">
                            {formatDate(upd.created_at || upd.createdAt)}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-[#1F2937]">{upd.title}</h3>
                      <p className="text-sm text-[#1F2937] leading-relaxed whitespace-pre-line">
                        {upd.content}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COMMENTS */}
          {activeTab === 'comments' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Post Comment Box */}
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4">
                <h4 className="text-base font-bold text-[#1F2937] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#007979]" /> Join the Discussion
                </h4>

                {isAuthenticated ? (
                  <form onSubmit={handlePostComment} className="space-y-3">
                    <textarea
                      rows={3}
                      placeholder="Ask a question or leave a message of encouragement for the team..."
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#007979]"
                      required
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={postingComment}
                        icon={Send}
                      >
                        Post Comment
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center space-y-2">
                    <p className="text-xs text-[#6B7280]">
                      You must be signed in to post a comment on this campaign.
                    </p>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#007979] hover:underline"
                    >
                      Sign in to your FundCamp account →
                    </Link>
                  </div>
                )}
              </div>

              {/* Comments List */}
              {comments.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-[#E5E7EB] space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#007979] flex items-center justify-center mx-auto">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-[#1F2937]">Be the first to comment!</h4>
                  <p className="text-xs text-[#6B7280]">
                    Share your encouragement, questions, or ideas with the project creators.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((cmt, idx) => {
                    const authorName = cmt.user_name || cmt.userName || 'Campus Backer';
                    const authorDept = cmt.user_department || cmt.userDepartment || 'University Department';
                    const authorType = cmt.user_type || cmt.userType || 'Backer';
                    const isCommentAuthorCreator =
                      String(cmt.user_id) === String(campaign.creator_id) ||
                      authorName.toLowerCase() === campaign.creator?.name?.toLowerCase();

                    return (
                      <div
                        key={cmt.id || idx}
                        className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar name={authorName} size="md" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-[#1F2937]">{authorName}</span>
                                {isCommentAuthorCreator && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#007979] text-white">
                                    Creator
                                  </span>
                                )}
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-[#6B7280]">
                                  {authorType}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#6B7280] mt-0.5">{authorDept}</p>
                            </div>
                          </div>
                          <span className="text-[11px] text-[#6B7280]">
                            {formatDate(cmt.created_at || cmt.createdAt)}
                          </span>
                        </div>

                        <p className="text-sm text-[#1F2937] leading-relaxed pl-12 whitespace-pre-line">
                          {cmt.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 1 Column: Sticky Funding Widget */}
        <div className="space-y-6">
          <div className="sticky top-20 bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-sm space-y-6">
            {/* Funding Stats */}
            <div className="space-y-2">
              <span className="text-3xl font-extrabold text-[#1F2937]">
                {formatCurrency(amountRaised)}
              </span>
              <span className="text-sm text-[#6B7280] ml-2 font-medium">
                raised of {formatCurrency(goalAmount)} goal
              </span>

              {/* Progress Bar */}
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-[#24B1B1] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs text-[#6B7280] font-semibold pt-1">
                <span className="text-[#24B1B1]">{percentage}% funded</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {remainingDays} days left
                </span>
              </div>
            </div>

            {/* Donate CTA Button */}
            <div className="space-y-3">
              <Button
                variant="cta"
                size="lg"
                onClick={handleDonateClick}
                icon={Heart}
                className="w-full justify-center py-3.5 text-base shadow-md cursor-not-allowed opacity-90"
              >
                Donate / Support Project
              </Button>
              <div className="p-3 bg-[#FFE2AF]/30 rounded-xl border border-[#FFE2AF] flex items-start gap-2 text-xs text-[#8C5B00]">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#E37434]" />
                <p>
                  <strong>MVP Note:</strong> Payment gateway simulation active. Donations feature will be enabled in future backend release.
                </p>
              </div>
            </div>

            {/* Verification Trust Box */}
            <div className="pt-4 border-t border-[#E5E7EB] space-y-3 text-xs text-[#6B7280]">
              <div className="flex items-center gap-2 font-semibold text-[#1F2937]">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                <span>Verified FundCamp Campaign</span>
              </div>
              <p>
                All project funds are disbursed directly to university departmental research and student activity accounts upon milestone verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
