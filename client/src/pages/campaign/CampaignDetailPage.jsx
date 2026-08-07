import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { campaignService } from '../../services/campaignService';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
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
} from 'lucide-react';

export default function CampaignDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await campaignService.getCampaignById(id);
        setCampaign(data);
      } catch (err) {
        setError(err.message || 'Failed to load campaign');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

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
          onClick={() => navigate(-1)}
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
        {/* Left 2 Columns: Banner Image & Campaign Overview */}
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
                <p className="font-bold text-[#1F2937] text-base">{creator?.name}</p>
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

          {/* Detailed Story & Objectives */}
          <Card hoverable={false} className="space-y-6">
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
                <span>Verified CampFund Campaign</span>
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
