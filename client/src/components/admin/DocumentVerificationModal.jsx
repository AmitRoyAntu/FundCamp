import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import {
  ShieldCheck,
  XCircle,
  CheckCircle2,
  User,
  GraduationCap,
  Building2,
  Mail,
  IdCard,
  FileText,
  ExternalLink,
  Target,
  Calendar,
  Tag,
  AlertCircle,
  Check,
  X,
  MessageSquare,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const REJECT_PRESETS = [
  'Missing Departmental Approval / Endorsement Letter',
  'Incomplete Budget Breakdown or Financial Plan',
  'Unverified Medical Documentation or Hospital Certificate',
  'Creator University Identity Could Not Be Confirmed',
  'Campaign Does Not Align With University Crowdfunding Guidelines',
  'Duplicate or Previously Rejected Campaign',
];

export default function DocumentVerificationModal({
  isOpen,
  onClose,
  campaign,
  onApprove,
  onReject,
  isProcessing,
}) {
  const [action, setAction] = useState(null); // 'approve' | 'reject'
  const [feedback, setFeedback] = useState('');
  const [checklist, setChecklist] = useState({
    identity: false,
    department: false,
    budget: false,
    ethics: false,
  });

  if (!campaign) return null;

  const docs = Array.isArray(campaign.documents) ? campaign.documents : [];
  const allChecked = Object.values(checklist).every(Boolean);

  const handleToggleCheck = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApprove = () => {
    onApprove(campaign.id, feedback || 'Campaign verified and approved by University Administration.');
  };

  const handleReject = () => {
    if (!feedback.trim()) return;
    onReject(campaign.id, feedback);
  };

  const handleClose = () => {
    setAction(null);
    setFeedback('');
    setChecklist({ identity: false, department: false, budget: false, ethics: false });
    onClose();
  };

  const statusBadge = (status) => {
    const map = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    };
    return map[status] || map.pending;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="" size="lg">
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#007979]/10 text-[#007979] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                Campaign Verification Dossier
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${statusBadge(campaign.status)}`}>
                {campaign.status || 'Pending'}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Review all submitted documents and creator credentials before making a verification decision.
            </p>
          </div>
        </div>

        {/* Campaign Overview */}
        <div className="rounded-2xl border border-gray-200 overflow-hidden">
          {campaign.image && (
            <div className="w-full h-40 bg-gray-100 overflow-hidden">
              <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-4 space-y-3">
            <h3 className="text-lg font-bold text-gray-900">{campaign.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{campaign.description}</p>
            <div className="flex flex-wrap gap-3 text-xs text-gray-600">
              <span className="inline-flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#007979]" />
                {campaign.category || 'Education'}
              </span>
              <span className="inline-flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#007979]" />
                {campaign.department || campaign.creator_department}
              </span>
              <span className="inline-flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-[#E37434]" />
                Goal: {formatCurrency(campaign.goal_amount)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {formatDate(campaign.created_at)}
              </span>
            </div>
            {campaign.tags && campaign.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {(Array.isArray(campaign.tags) ? campaign.tags : []).map((t, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#007979]/10 text-[#007979] border border-[#007979]/20">
                    #{typeof t === 'string' ? t : t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Creator Credentials */}
        <div className="rounded-2xl border border-gray-200 p-4 space-y-3">
          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <User className="w-4 h-4 text-[#007979]" />
            Creator Credentials
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
              <GraduationCap className="w-4 h-4 text-[#007979] shrink-0" />
              <div>
                <p className="text-[11px] font-medium text-gray-500">Name & Role</p>
                <p className="text-sm font-semibold text-gray-900">
                  {campaign.creator_name} ({campaign.creator_user_type || campaign.creator_type || 'Student'})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
              <Mail className="w-4 h-4 text-[#007979] shrink-0" />
              <div>
                <p className="text-[11px] font-medium text-gray-500">Email</p>
                <p className="text-sm font-semibold text-gray-900">{campaign.creator_email || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
              <Building2 className="w-4 h-4 text-[#007979] shrink-0" />
              <div>
                <p className="text-[11px] font-medium text-gray-500">Department</p>
                <p className="text-sm font-semibold text-gray-900">{campaign.creator_department || campaign.department}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
              <IdCard className="w-4 h-4 text-[#007979] shrink-0" />
              <div>
                <p className="text-[11px] font-medium text-gray-500">University ID</p>
                <p className="text-sm font-semibold text-gray-900">{campaign.creator_university_id || `STU-2026-${campaign.creator_id}`}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Documents */}
        <div className="rounded-2xl border border-gray-200 p-4 space-y-3">
          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#007979]" />
            Submitted Verification Documents ({docs.length})
          </h4>
          {docs.length === 0 ? (
            <div className="text-center py-6 text-sm text-gray-500">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              No verification documents were submitted with this campaign.
            </div>
          ) : (
            <div className="space-y-2">
              {docs.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#007979]/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#007979]/10 text-[#007979] flex items-center justify-center shrink-0">
                      <FileText className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{doc.name}</p>
                      <p className="text-[11px] text-gray-500">
                        {doc.type || 'Document'} • {doc.size || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#007979] bg-[#007979]/10 hover:bg-[#007979]/20 transition-colors shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* University Verification Checklist */}
        {campaign.status === 'pending' && (
          <div className="rounded-2xl border border-gray-200 p-4 space-y-3">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#007979]" />
              University Verification Checklist
            </h4>
            <div className="space-y-2">
              {[
                { key: 'identity', label: 'University affiliation & ID verified' },
                { key: 'department', label: 'Departmental approval / endorsement verified' },
                { key: 'budget', label: 'Funding goal & expenditure plan reasonable' },
                { key: 'ethics', label: 'Compliant with university ethics & crowdfunding guidelines' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleToggleCheck(key)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer text-left ${
                    checklist[key]
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-gray-50 border-gray-100 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                    checklist[key] ? 'bg-emerald-500 text-white' : 'bg-white border-2 border-gray-300'
                  }`}>
                    {checklist[key] && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Decision Action Panel */}
        {campaign.status === 'pending' && (
          <div className="rounded-2xl border-2 border-gray-200 p-5 space-y-4">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#007979]" />
              Admin Verification Decision
            </h4>

            {!action && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAction('approve')}
                  disabled={!allChecked}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    allChecked
                      ? 'border-emerald-200 bg-emerald-50 hover:border-emerald-400 text-emerald-800'
                      : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-8 h-8" />
                  <span className="text-sm font-bold">Approve Campaign</span>
                  {!allChecked && (
                    <span className="text-[10px] text-gray-400">Complete checklist first</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setAction('reject')}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-red-200 bg-red-50 hover:border-red-400 text-red-700 transition-all cursor-pointer"
                >
                  <XCircle className="w-8 h-8" />
                  <span className="text-sm font-bold">Reject Campaign</span>
                </button>
              </div>
            )}

            {action === 'approve' && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800">Approving Campaign</p>
                    <p className="text-xs text-emerald-600">
                      This will make the campaign publicly visible on the donor dashboard.
                    </p>
                  </div>
                </div>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Optional: Add an encouragement note for the creator..."
                  rows={3}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#24B1B1] resize-none"
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setAction(null)} icon={X}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleApprove}
                    isLoading={isProcessing}
                    icon={CheckCircle2}
                    className="!bg-emerald-600 hover:!bg-emerald-700"
                  >
                    Confirm Approval
                  </Button>
                </div>
              </div>
            )}

            {action === 'reject' && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-800">Rejecting Campaign</p>
                    <p className="text-xs text-red-600">
                      Select a reason below or write a custom explanation. Feedback will be sent to the creator.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {REJECT_PRESETS.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFeedback(preset)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                        feedback === preset
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:text-red-700'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Explain the reason for rejection (required)..."
                  rows={3}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setAction(null)} icon={X}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleReject}
                    isLoading={isProcessing}
                    disabled={!feedback.trim()}
                    icon={XCircle}
                    className="!bg-red-600 hover:!bg-red-700"
                  >
                    Confirm Rejection
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* If already reviewed, show existing admin feedback */}
        {campaign.status !== 'pending' && campaign.admin_feedback && (
          <div className={`rounded-2xl border p-4 ${
            campaign.status === 'approved'
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <h4 className={`text-sm font-bold flex items-center gap-2 mb-2 ${
              campaign.status === 'approved' ? 'text-emerald-800' : 'text-red-800'
            }`}>
              {campaign.status === 'approved' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              Admin Feedback
            </h4>
            <p className={`text-sm ${
              campaign.status === 'approved' ? 'text-emerald-700' : 'text-red-700'
            }`}>
              {campaign.admin_feedback}
            </p>
            {campaign.verified_at && (
              <p className="text-[11px] text-gray-500 mt-2">
                Reviewed on {formatDate(campaign.verified_at)}
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
