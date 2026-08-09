import React, { useState } from 'react';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatters';
import {
  X,
  Heart,
  CheckCircle2,
  Lock,
  Smartphone,
  CreditCard,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function DonateModal({ campaign, isOpen, onClose, onSuccess }) {
  if (!isOpen || !campaign) return null;

  const presetAmounts = [500, 1000, 2500, 5000];

  const [step, setStep] = useState(1); // 1: Amount & Method, 2: Payment Details, 3: Processing, 4: Success
  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bKash');

  // Form Fields
  const [mobileNumber, setMobileNumber] = useState('01700000000');
  const [otp, setOtp] = useState('1234');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [donorName, setDonorName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [loading, setLoading] = useState(false);
  const [txId, setTxId] = useState('');

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleNextToDetails = () => {
    if (finalAmount <= 0) return;
    setStep(2);
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (finalAmount <= 0) return;

    setStep(3); // Processing animation
    setLoading(true);

    // Simulate realistic 1.8s gateway processing delay
    setTimeout(async () => {
      try {
        const generatedTx = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
        setTxId(generatedTx);

        const effectiveDonorName = isAnonymous
          ? 'Anonymous Backer'
          : donorName.trim() || 'Campus Backer';

        // Trigger parent success callback
        await onSuccess({
          amount: finalAmount,
          donorName: effectiveDonorName,
          paymentMethod,
        });

        setLoading(false);
        setStep(4); // Success screen
      } catch (err) {
        setLoading(false);
        setStep(2);
      }
    }, 1800);
  };

  const handleClose = () => {
    setStep(1);
    setSelectedAmount(1000);
    setCustomAmount('');
    setPaymentMethod('bKash');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#E5E7EB] overflow-hidden relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#FFFDF8]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E37434] text-white flex items-center justify-center shadow-xs">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1F2937]">Support Initiative</h3>
              <p className="text-[11px] text-[#6B7280] truncate max-w-[240px] sm:max-w-[320px]">
                {campaign.title}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Select Amount & Payment Method */}
        {step === 1 && (
          <div className="p-6 space-y-6">
            {/* Amount Presets */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1F2937]">
                1. Select Donation Amount (৳ BDT)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {presetAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-3 px-2 rounded-2xl border text-sm font-extrabold transition-all cursor-pointer ${
                      selectedAmount === amt && !customAmount
                        ? 'border-[#007979] bg-[#007979] text-white shadow-sm ring-2 ring-[#007979]/20'
                        : 'border-[#E5E7EB] bg-white text-[#1F2937] hover:border-[#007979]/50'
                    }`}
                  >
                    ৳{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="relative pt-1">
                <span className="absolute left-3.5 top-3.5 text-sm font-bold text-[#6B7280]">৳</span>
                <input
                  type="number"
                  placeholder="Enter custom amount..."
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(0);
                  }}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#007979]"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1F2937]">
                2. Choose Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* bKash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bKash')}
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                    paymentMethod === 'bKash'
                      ? 'border-[#D12053] bg-[#D12053]/5 ring-2 ring-[#D12053]'
                      : 'border-[#E5E7EB] hover:bg-gray-50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-[#D12053] text-white flex items-center justify-center font-black text-xs shadow-xs">
                    bK
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-[#1F2937]">bKash</p>
                    <p className="text-[10px] text-[#6B7280]">Mobile Wallet</p>
                  </div>
                </button>

                {/* Nagad */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Nagad')}
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                    paymentMethod === 'Nagad'
                      ? 'border-[#F7921E] bg-[#F7921E]/5 ring-2 ring-[#F7921E]'
                      : 'border-[#E5E7EB] hover:bg-gray-50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-[#F7921E] text-white flex items-center justify-center font-black text-xs shadow-xs">
                    NG
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-[#1F2937]">Nagad</p>
                    <p className="text-[10px] text-[#6B7280]">Digital Wallet</p>
                  </div>
                </button>

                {/* Rocket */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Rocket')}
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                    paymentMethod === 'Rocket'
                      ? 'border-[#8C3494] bg-[#8C3494]/5 ring-2 ring-[#8C3494]'
                      : 'border-[#E5E7EB] hover:bg-gray-50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-[#8C3494] text-white flex items-center justify-center font-black text-xs shadow-xs">
                    RC
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-[#1F2937]">Rocket</p>
                    <p className="text-[10px] text-[#6B7280]">DBBL Wallet</p>
                  </div>
                </button>

                {/* Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Card')}
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                    paymentMethod === 'Card'
                      ? 'border-[#007979] bg-[#007979]/5 ring-2 ring-[#007979]'
                      : 'border-[#E5E7EB] hover:bg-gray-50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-[#007979] text-white flex items-center justify-center shadow-xs">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-[#1F2937]">Credit/Debit</p>
                    <p className="text-[10px] text-[#6B7280]">Visa / Mastercard</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Total Summary & Continue Button */}
            <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
              <div>
                <p className="text-xs text-[#6B7280]">Total Support Amount</p>
                <p className="text-2xl font-extrabold text-[#007979]">{formatCurrency(finalAmount)}</p>
              </div>
              <Button
                variant="cta"
                size="lg"
                onClick={handleNextToDetails}
                disabled={finalAmount <= 0}
                icon={ArrowRight}
              >
                Proceed
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Payment Details (Simulated Checkout) */}
        {step === 2 && (
          <form onSubmit={handleConfirmPayment} className="p-6 space-y-5">
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
              <span className="text-xs font-bold text-[#6B7280]">Payment via {paymentMethod}</span>
              <span className="text-base font-extrabold text-[#007979]">{formatCurrency(finalAmount)}</span>
            </div>

            {/* MFS Input Fields (bKash/Nagad/Rocket) */}
            {paymentMethod !== 'Card' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2937] mb-1">
                    {paymentMethod} Account Mobile Number
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#007979]"
                      placeholder="017XXXXXXXX"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2937] mb-1">
                    Simulated Security OTP Pin (Default: 1234)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="password"
                      maxLength={4}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#007979] tracking-widest font-bold"
                      placeholder="••••"
                      required
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Card Fields */
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2937] mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#007979]"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2937] mb-1">Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#007979]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2937] mb-1">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#007979]"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Donor Options */}
            <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] mb-1">
                  Donor Display Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Tanvir Rahman or Leave blank for Anonymous"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  disabled={isAnonymous}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#007979] disabled:opacity-50"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-[#6B7280] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded text-[#007979]"
                />
                <span>Donate anonymously (Hide name on backer feed)</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-1/3 justify-center">
                Back
              </Button>
              <Button type="submit" variant="cta" className="w-2/3 justify-center" icon={Lock}>
                Confirm & Pay {formatCurrency(finalAmount)}
              </Button>
            </div>
          </form>
        )}

        {/* STEP 3: Processing Loader */}
        {step === 3 && (
          <div className="p-12 text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full border-4 border-[#007979]/20 border-t-[#007979] animate-spin mx-auto" />
            <h4 className="text-lg font-bold text-[#1F2937]">Connecting to {paymentMethod} Gateway...</h4>
            <p className="text-xs text-[#6B7280]">
              Verifying transaction authorization and transferring funds to University Project Account.
            </p>
          </div>
        )}

        {/* STEP 4: Success Screen */}
        {step === 4 && (
          <div className="p-8 text-center space-y-5 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-[#007979] uppercase tracking-wider">Payment Verified</span>
              <h3 className="text-2xl font-extrabold text-[#1F2937]">Thank You for Your Support!</h3>
              <p className="text-sm text-[#6B7280] max-w-sm mx-auto">
                Your donation of <strong className="text-[#007979]">{formatCurrency(finalAmount)}</strong> has been disbursed to the initiative.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs space-y-1.5 text-left max-w-xs mx-auto">
              <div className="flex justify-between text-[#6B7280]">
                <span>Transaction ID:</span>
                <span className="font-mono font-bold text-[#1F2937]">{txId}</span>
              </div>
              <div className="flex justify-between text-[#6B7280]">
                <span>Payment Method:</span>
                <span className="font-semibold text-[#1F2937]">{paymentMethod}</span>
              </div>
              <div className="flex justify-between text-[#6B7280]">
                <span>Disbursed To:</span>
                <span className="font-semibold text-[#1F2937]">{campaign.department}</span>
              </div>
            </div>

            <Button variant="primary" size="lg" onClick={handleClose} icon={Sparkles} className="w-full justify-center">
              Back to Campaign
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
