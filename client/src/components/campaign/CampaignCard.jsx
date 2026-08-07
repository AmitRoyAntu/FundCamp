import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Avatar from '../common/Avatar';
import { formatCurrency, calculatePercentage, formatDate } from '../../utils/formatters';
import { ArrowRight, GraduationCap, Building2 } from 'lucide-react';

export default function CampaignCard({ campaign }) {
  const navigate = useNavigate();

  if (!campaign) return null;

  const {
    id,
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
  } = campaign;

  const percentage = calculatePercentage(amountRaised, goalAmount);

  const getStatusBadge = () => {
    if (status === 'completed' || percentage >= 100) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          Funded
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#007979]/10 text-[#007979]">
        Active
      </span>
    );
  };

  return (
    <Card
      onClick={() => navigate(`/campaign/${id}`)}
      className="flex flex-col h-full overflow-hidden p-0 border border-[#E5E7EB] group cursor-pointer"
    >
      {/* Campaign Image */}
      <div className="relative w-full h-48 bg-gray-100 overflow-hidden shrink-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-xs text-[#007979] shadow-xs">
            {category}
          </span>
        </div>
        <div className="absolute top-3 right-3">{getStatusBadge()}</div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-[#1F2937] group-hover:text-[#007979] transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-[#6B7280] line-clamp-2 leading-relaxed">{description}</p>
        </div>

        {/* Funding Progress */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-baseline text-sm">
            <div>
              <span className="font-bold text-[#1F2937]">{formatCurrency(amountRaised)}</span>
              <span className="text-xs text-[#6B7280] ml-1">raised of {formatCurrency(goalAmount)}</span>
            </div>
            <span className="font-semibold text-xs text-[#24B1B1]">{percentage}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#24B1B1] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Creator & Department Info */}
        <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#6B7280]">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar src={creator?.avatar} name={creator?.name} size="sm" />
            <div className="truncate">
              <p className="font-medium text-[#1F2937] truncate">{creator?.name}</p>
              <div className="flex items-center gap-1 text-[11px] text-[#6B7280]">
                <GraduationCap className="w-3 h-3 text-[#007979]" />
                <span>{creator?.userType}</span>
                <span>•</span>
                <span className="truncate">{department}</span>
              </div>
            </div>
          </div>
          <div className="shrink-0 pl-2">
            <span className="inline-flex items-center text-[#007979] font-medium group-hover:translate-x-1 transition-transform">
              View <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
