import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { campaignService } from '../../services/campaignService';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  ShieldAlert,
  FileWarning,
  CheckCircle2,
  X,
  Send,
} from 'lucide-react';

const REPORT_REASONS = [
  { id: 'Suspected Fraud / Scam', label: 'Suspected Fraud / Scam' },
  { id: 'Fake or Forged Proof Documents', label: 'Fake or Forged Proof Documents' },
  { id: 'Misleading Campaign Story / Goal', label: 'Misleading Story or Goal' },
  { id: 'Misuse of Donated Funds', label: 'Misuse of Donated Funds' },
  { id: 'Impersonation or University Policy Violation', label: 'Impersonation / Policy Violation' },
  { id: 'Other Concern', label: 'Other Concern' },
];

export default function ReportCampaignModal({ isOpen, onClose, campaign }) {
  const { currentUser } = useAuth();
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0].id);
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState(currentUser?.fullName || '');
  const [reporterEmail, setReporterEmail] = useState(currentUser?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!campaign) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Please provide details explaining your concern.');
      return;
    }

    setIsSubmitting(true);
    try {
      await campaignService.reportCampaign(campaign.id, {
        reason: selectedReason,
        description: description.trim(),
        reporterName: reporterName.trim() || 'Campus Member',
        reporterEmail: reporterEmail.trim() || undefined,
      });

      toast.success('Report submitted. University administration will investigate.', {
        icon: '🛡️',
        duration: 4000,
      });

      setDescription('');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Header */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Report Campaign</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Submit a formal fraud or integrity report to the university administration regarding:
            </p>
            <p className="text-xs font-semibold text-[#007979] truncate mt-1">
              "{campaign.title}"
            </p>
          </div>
        </div>

        {/* Reason Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            Primary Reason for Report <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {REPORT_REASONS.map((r) => {
              const isSelected = selectedReason === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedReason(r.id)}
                  className={`text-left px-3 py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'border-red-500 bg-red-50 text-red-700 font-bold shadow-xs'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-red-500' : 'bg-gray-300'}`} />
                    <span>{r.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Explanation */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            Detailed Explanation & Evidence <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            placeholder="Explain why you believe this campaign is fraudulent or violates university policies (e.g. forged receipts, incorrect medical documents, unauthorized student club representation)..."
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
          />
        </div>

        {/* Reporter Optional Identity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              Your Name (Optional)
            </label>
            <input
              type="text"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              placeholder="Campus Member / Anonymous"
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#24B1B1]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              Your Institutional Email (Optional)
            </label>
            <input
              type="email"
              value={reporterEmail}
              onChange={(e) => setReporterEmail(e.target.value)}
              placeholder="student@university.edu"
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#24B1B1]"
            />
          </div>
        </div>

        {/* Notice */}
        <p className="text-[11px] text-gray-400 italic">
          All reports are logged with institutional audit timestamps and handled strictly by the Office of Student Affairs & Administration.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
          <Button variant="ghost" size="sm" onClick={onClose} icon={X}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            icon={Send}
            className="!bg-red-600 hover:!bg-red-700"
          >
            Submit Fraud Report
          </Button>
        </div>
      </form>
    </Modal>
  );
}
