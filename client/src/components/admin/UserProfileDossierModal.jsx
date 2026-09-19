import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import Loader from '../common/Loader';
import { formatCurrency, formatDate, calculatePercentage } from '../../utils/formatters';
import toast from 'react-hot-toast';
import {
  X,
  User,
  Mail,
  Building2,
  Calendar,
  Target,
  Heart,
  MessageSquare,
  ExternalLink,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Shield,
  CreditCard,
  ArrowUpRight,
  BadgePercent,
  Eye,
} from 'lucide-react';

export default function UserProfileDossierModal({ userId, isOpen, onClose, onCampaignClick }) {
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns' | 'donations' | 'comments'
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  useEffect(() => {
    if (!isOpen || !userId) {
      setDossier(null);
      return;
    }

    const fetchDossier = async () => {
      setLoading(true);
      try {
        const data = await adminService.getUserDossier(userId);
        setDossier(data);
      } catch (err) {
        console.error('Failed to load user dossier:', err);
        toast.error('Failed to load user dossier details');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchDossier();
  }, [userId, isOpen]);

  if (!isOpen) return null;

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to permanently remove this comment?')) return;

    setDeletingCommentId(commentId);
    try {
      await adminService.deleteComment(commentId);
      toast.success('Comment removed successfully');
      // Update local comments in dossier
      setDossier((prev) => {
        if (!prev) return prev;
        const updatedComments = prev.comments.filter((c) => c.id !== commentId);
        return {
          ...prev,
          comments: updatedComments,
          summary: {
            ...prev.summary,
            totalComments: updatedComments.length,
          },
        };
      });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to remove comment');
    } finally {
      setDeletingCommentId(null);
    }
  };

  const user = dossier?.user;
  const campaigns = dossier?.campaigns || [];
  const donations = dossier?.donations || [];
  const comments = dossier?.comments || [];
  const summary = dossier?.summary || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="relative bg-linear-to-r from-[#007979] to-[#005a5a] text-white p-6 sm:p-8">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close dossier"
          >
            <X className="w-5 h-5" />
          </button>

          {loading ? (
            <div className="py-6 flex justify-center">
              <Loader text="Loading dossier data..." />
            </div>
          ) : user ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <Avatar name={user.name} size="xl" />
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-black">{user.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs">
                    {user.user_type || 'User'}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      user.status === 'deactivated'
                        ? 'bg-red-500/80 text-white'
                        : 'bg-emerald-500/80 text-white'
                    }`}
                  >
                    {user.status || 'Active'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-teal-100">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {user.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    {user.department || 'University Member'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {formatDate(user.created_at)}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {/* QUICK STATS SUMMARY BAR */}
          {!loading && user && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/15">
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
                <div className="flex items-center gap-2 text-teal-200 text-xs font-medium">
                  <Heart className="w-3.5 h-3.5 text-pink-300" />
                  Total Donated
                </div>
                <div className="text-xl font-black mt-1 text-white">
                  {formatCurrency(summary.totalDonated || 0)}
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
                <div className="flex items-center gap-2 text-teal-200 text-xs font-medium">
                  <Target className="w-3.5 h-3.5 text-[#FFE2AF]" />
                  Campaigns
                </div>
                <div className="text-xl font-black mt-1 text-white">
                  {summary.campaignsCreated || 0}
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
                <div className="flex items-center gap-2 text-teal-200 text-xs font-medium">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-300" />
                  Donation Count
                </div>
                <div className="text-xl font-black mt-1 text-white">
                  {summary.totalDonations || 0}
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
                <div className="flex items-center gap-2 text-teal-200 text-xs font-medium">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                  Comments
                </div>
                <div className="text-xl font-black mt-1 text-white">
                  {summary.totalComments || 0}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex border-b border-gray-200 bg-gray-50/80 px-6 sm:px-8">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'campaigns'
                ? 'border-[#007979] text-[#007979]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Target className="w-4 h-4" />
            Campaigns Created ({campaigns.length})
          </button>

          <button
            onClick={() => setActiveTab('donations')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'donations'
                ? 'border-[#007979] text-[#007979]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Heart className="w-4 h-4" />
            Donation History ({donations.length})
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'comments'
                ? 'border-[#007979] text-[#007979]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Comments & Discussion ({comments.length})
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4">
          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader text="Loading records..." />
            </div>
          ) : (
            <>
              {/* TAB 1: CAMPAIGNS CREATED */}
              {activeTab === 'campaigns' && (
                <div className="space-y-4">
                  {campaigns.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                      <Target className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-600">No campaigns launched yet</p>
                      <p className="text-xs text-gray-400 mt-1">This user has not submitted any campus initiatives.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {campaigns.map((camp) => {
                        const raised = parseFloat(camp.amount_raised) || 0;
                        const goal = parseFloat(camp.goal_amount) || 1;
                        const pct = Math.min(100, Math.round((raised / goal) * 100));

                        return (
                          <div
                            key={camp.id}
                            className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-[#24B1B1] hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="space-y-1.5 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-[#007979]">
                                  {camp.category}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                    camp.status === 'approved'
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : camp.status === 'pending'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-rose-100 text-rose-700'
                                  }`}
                                >
                                  {camp.status}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatDate(camp.created_at)}
                                </span>
                              </div>
                              <h4 className="font-bold text-sm text-[#1F2937] hover:text-[#007979] transition-colors">
                                {camp.title}
                              </h4>
                              
                              {/* Funding progress */}
                              <div className="flex items-center gap-3 pt-1">
                                <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden max-w-[200px]">
                                  <div
                                    className="bg-[#007979] h-full rounded-full"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500 font-medium">
                                  {formatCurrency(raised)} / {formatCurrency(goal)} ({pct}%)
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <Link
                                to={`/campaigns/${camp.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-[#007979] bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View Public Page
                                <ArrowUpRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: DONATION HISTORY */}
              {activeTab === 'donations' && (
                <div className="space-y-4">
                  {donations.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                      <Heart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-600">No donations recorded</p>
                      <p className="text-xs text-gray-400 mt-1">This user has not backed any campaigns yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {donations.map((d) => (
                        <div
                          key={d.id}
                          className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-[#24B1B1] hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-[#007979]">
                                {d.campaign_category || 'General'}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatDate(d.created_at)}
                              </span>
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                Method: {d.payment_method || 'Online'}
                              </span>
                            </div>

                            <div className="font-bold text-sm text-[#1F2937]">
                              {d.campaign_title || `Campaign #${d.campaign_id}`}
                            </div>

                            {d.creator_name && (
                              <p className="text-xs text-gray-500">
                                Creator: <span className="font-medium text-gray-700">{d.creator_name}</span>
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-4 sm:flex-col sm:items-end shrink-0">
                            <div className="text-lg font-black text-[#007979]">
                              +{formatCurrency(d.amount)}
                            </div>
                            <Link
                              to={`/campaigns/${d.campaign_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-gray-500 hover:text-[#007979] flex items-center gap-1"
                            >
                              Visit Campaign <ArrowUpRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: COMMENTS & DISCUSSION */}
              {activeTab === 'comments' && (
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                      <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-600">No comments posted</p>
                      <p className="text-xs text-gray-400 mt-1">This user has not participated in campaign discussions.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {comments.map((cmt) => (
                        <div
                          key={cmt.id}
                          className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-gray-300 transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <Link
                                  to={`/campaigns/${cmt.campaign_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-bold text-[#007979] hover:underline flex items-center gap-1"
                                >
                                  {cmt.campaign_title || `Campaign #${cmt.campaign_id}`}
                                  <ArrowUpRight className="w-3 h-3" />
                                </Link>
                                <span className="text-xs text-gray-400">
                                  {formatDate(cmt.created_at)}
                                </span>
                              </div>
                            </div>

                            {/* Comment deletion moderation */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-rose-600 hover:bg-rose-50 border-rose-200 shrink-0 text-xs py-1 px-2.5"
                              icon={Trash2}
                              loading={deletingCommentId === cmt.id}
                              onClick={() => handleDeleteComment(cmt.id)}
                            >
                              Remove
                            </Button>
                          </div>

                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl whitespace-pre-line leading-relaxed border border-gray-100">
                            {cmt.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close Dossier
          </Button>
        </div>
      </div>
    </div>
  );
}
