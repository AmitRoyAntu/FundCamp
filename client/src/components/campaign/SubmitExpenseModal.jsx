import React, { useState, useRef } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { campaignService } from '../../services/campaignService';
import toast from 'react-hot-toast';
import {
  Receipt,
  Upload,
  Paperclip,
  CheckCircle2,
  X,
  FileText,
  AlertCircle,
  Building2,
  Banknote,
  Tag,
} from 'lucide-react';

const EXPENSE_CATEGORIES = [
  'Equipment & Hardware',
  'Lab Reagents & Chemicals',
  'Software & Cloud Services',
  'Student Stipends & Travel',
  'Printing & Prototyping',
  'Logistics & Venue',
  'Other Expenditure',
];

export default function SubmitExpenseModal({
  isOpen,
  onClose,
  campaign,
  onExpenseSubmitted,
}) {
  const fileInputRef = useRef(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [vendor, setVendor] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [receiptName, setReceiptName] = useState('');
  const [receiptSize, setReceiptSize] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!campaign) return null;

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Receipt file size must be under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setReceiptUrl(e.target.result);
      setReceiptName(file.name);
      setReceiptSize(
        file.size < 1024 * 1024
          ? `${Math.round(file.size / 1024)} KB`
          : `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      );
      toast.success(`Attached receipt "${file.name}"`);
    };
    reader.onerror = () => {
      toast.error('Failed to read receipt file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleClearReceipt = () => {
    setReceiptUrl('');
    setReceiptName('');
    setReceiptSize('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter an expense title.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid expense amount greater than 0.');
      return;
    }
    if (!vendor.trim()) {
      toast.error('Please enter the vendor or payee name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        amount: parsedAmount,
        vendor: vendor.trim(),
        category,
        receipt_url: receiptUrl || null,
        notes: notes.trim() || null,
      };

      const res = await campaignService.createCampaignExpense(campaign.id, payload);
      toast.success('Expense receipt submitted! It will appear under Financial Transparency once audited.', {
        icon: '🧾',
        duration: 4500,
      });

      if (onExpenseSubmitted) {
        onExpenseSubmitted(res?.expense || { ...payload, status: 'pending', created_at: new Date().toISOString() });
      }

      // Reset form
      setTitle('');
      setAmount('');
      setVendor('');
      setCategory(EXPENSE_CATEGORIES[0]);
      setNotes('');
      handleClearReceipt();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit expense receipt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5 max-h-[85vh] overflow-y-auto pr-1">
        {/* Modal Header */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#007979]/10 text-[#007979] flex items-center justify-center shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">Log Campaign Expense</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
                Audited by Admin
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Submit verified expenditure receipts to keep university backers informed of how campaign funds are spent.
            </p>
            <p className="text-xs font-semibold text-[#007979] truncate mt-1">
              Campaign: "{campaign.title}"
            </p>
          </div>
        </div>

        {/* Expense Title */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Expense Item / Purpose <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 10x STM32 Microcontroller Boards & Sensor Shields"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#24B1B1]"
          />
        </div>

        {/* Amount & Vendor Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Amount Spent (৳ BDT) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">৳</span>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 7500"
                className="w-full pl-8 pr-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#24B1B1]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Vendor / Supplier <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="e.g. Star Tech, Dhaka Electronic Lab"
                className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#24B1B1]"
              />
            </div>
          </div>
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Expense Category
          </label>
          <div className="relative">
            <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#24B1B1] cursor-pointer"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Receipt Voucher / Invoice Attachment */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            Proof Receipt / Invoice File
          </label>

          {receiptUrl ? (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-emerald-900 truncate">{receiptName || 'Receipt file'}</p>
                  <p className="text-[11px] text-emerald-700">{receiptSize || 'Ready for audit'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearReceipt}
                className="p-1 text-emerald-700 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                title="Remove receipt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#007979] bg-[#007979]/5'
                  : 'border-gray-200 hover:border-[#007979] bg-gray-50/50 hover:bg-gray-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center space-y-1.5">
                <div className="w-10 h-10 rounded-xl bg-[#007979]/10 text-[#007979] flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-gray-800">
                  Upload Official Invoice, Cash Memo, or Receipt Slip
                </p>
                <p className="text-[11px] text-gray-400">
                  PNG, JPG, PDF up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Audit Notes / Justification (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Provide context on how this purchase fulfills milestone objectives or details on warranty/asset inventory."
            className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#24B1B1]"
          />
        </div>

        {/* Audit Notice Callout */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#007979]/5 border border-[#007979]/20 text-xs text-[#007979]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            All submitted expense receipts are cataloged in the University Administration Audit Ledger. Verified receipts will show a green audit badge on the public campaign transparency tab.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            icon={Receipt}
          >
            Submit for Audit
          </Button>
        </div>
      </form>
    </Modal>
  );
}
