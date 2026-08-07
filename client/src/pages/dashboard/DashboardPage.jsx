import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignService } from '../../services/campaignService';
import CampaignCard from '../../components/campaign/CampaignCard';
import PageHeader from '../../components/common/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import { CampaignSkeleton } from '../../components/common/Skeleton';
import Button from '../../components/common/Button';
import Sidebar from '../../components/layout/Sidebar';
import { CAMPAIGN_CATEGORIES } from '../../constants/categories';
import { USER_TYPES } from '../../constants/userTypes';
import { PlusCircle, SlidersHorizontal, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedUserType, setSelectedUserType] = useState('All');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    fetchCampaigns();
  }, [search, selectedCategory, selectedStatus, selectedUserType, sortBy]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const data = await campaignService.getCampaigns({
        search,
        category: selectedCategory,
        status: selectedStatus,
        userType: selectedUserType,
        sortBy,
      });
      setCampaigns(data);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSelectedUserType('All');
    setSortBy('recent');
  };

  const hasActiveFilters =
    search !== '' ||
    selectedCategory !== 'All' ||
    selectedStatus !== 'All' ||
    selectedUserType !== 'All';

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Campaigns Dashboard"
        description="Discover, search, and support university fundraising initiatives across all departments."
      >
        <Button
          variant="primary"
          onClick={() => navigate('/create')}
          icon={PlusCircle}
        >
          Create Campaign
        </Button>
      </PageHeader>

      <div className="flex gap-8">
        {/* Desktop Category Sidebar */}
        <Sidebar
          activeCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />

        {/* Main Content Area */}
        <div className="flex-1 space-y-6 min-w-0">
          {/* Top Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by campaign title, department, or creator..."
            />

            {/* Filter Pills / Dropdowns */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E5E7EB]">
              {/* Category Pills (Mobile/Desktop Quick Selector) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === 'All'
                      ? 'bg-[#007979] text-white shadow-xs'
                      : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
                  }`}
                >
                  All Categories
                </button>
                {CAMPAIGN_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-[#007979] text-white shadow-xs'
                        : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Status, Role & Sort Selectors */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {/* Status Dropdown */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#E5E7EB] bg-white text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#24B1B1] cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="completed">Funded</option>
                </select>

                {/* User Type Dropdown */}
                <select
                  value={selectedUserType}
                  onChange={(e) => setSelectedUserType(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#E5E7EB] bg-white text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#24B1B1] cursor-pointer"
                >
                  <option value="All">All Roles</option>
                  {USER_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>

                {/* Sort By Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#E5E7EB] bg-white text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#24B1B1] cursor-pointer"
                >
                  <option value="recent">Most Recent</option>
                  <option value="most_funded">Most Funded ($)</option>
                  <option value="progress">Highest Progress (%)</option>
                  <option value="goal_high">Highest Goal ($)</option>
                </select>

                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs text-[#DC2626] hover:underline font-semibold px-2 cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results Summary Counter */}
          <div className="flex items-center justify-between text-xs font-medium text-[#6B7280]">
            <p>
              Showing <span className="font-bold text-[#1F2937]">{campaigns.length}</span> campaign{campaigns.length !== 1 ? 's' : ''}
            </p>
            {hasActiveFilters && (
              <span className="text-[#007979]">Filtered results</span>
            )}
          </div>

          {/* Campaign Grid or Loading Skeletons or Empty State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <CampaignSkeleton />
              <CampaignSkeleton />
              <CampaignSkeleton />
              <CampaignSkeleton />
              <CampaignSkeleton />
              <CampaignSkeleton />
            </div>
          ) : campaigns.length === 0 ? (
            <EmptyState
              variant="search"
              title="No campaigns match your search"
              description="Try adjusting your keywords, switching categories, or clearing active filters to see more results."
              actionText="Reset All Filters"
              onAction={handleClearFilters}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
