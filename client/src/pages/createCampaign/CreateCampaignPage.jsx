import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { campaignService } from '../../services/campaignService';
import { useAuth } from '../../hooks/useAuth';
import PageHeader from '../../components/common/PageHeader';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Dropdown from '../../components/common/Dropdown';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { CAMPAIGN_CATEGORIES } from '../../constants/categories';
import { DEPARTMENTS } from '../../constants/userTypes';
import toast from 'react-hot-toast';
import {
  Sparkles,
  Banknote,
  Image as ImageIcon,
  Building2,
  Tag,
  ArrowLeft,
  GraduationCap,
} from 'lucide-react';

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  // Preset recommended high-res Unsplash images for quick click selection
  const presetImages = [
    { label: 'Technology / Research', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200' },
    { label: 'Medical / Biology Lab', url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=1200' },
    { label: 'Campus / Student Life', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200' },
    { label: 'Sustainability / Ecology', url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=1200' },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      category: 'Education',
      department: currentUser?.department || 'Computer Science & Engineering',
      goalAmount: '',
      description: '',
      image: presetImages[0].url,
    },
  });

  const selectedImage = watch('image');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const created = await campaignService.createCampaign(data, currentUser);
      toast.success('Campaign created successfully!');
      navigate(`/campaign/${created.id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to create campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <PageHeader
        title="Create New Campaign"
        description="Launch a university fundraising initiative to power your research, lab, or campus project."
      >
        <Button variant="ghost" onClick={() => navigate('/dashboard')} icon={ArrowLeft}>
          Cancel
        </Button>
      </PageHeader>

      <Card className="p-8 shadow-md border border-[#E5E7EB]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Creator Badge Header */}
          <div className="p-4 rounded-xl bg-[#007979]/5 border border-[#007979]/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#007979] text-white flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#007979] uppercase tracking-wider">
                Publishing as Verified Creator
              </p>
              <p className="text-sm font-bold text-[#1F2937]">
                {currentUser?.fullName} ({currentUser?.userType}) — {currentUser?.department}
              </p>
            </div>
          </div>

          {/* Campaign Title */}
          <Input
            label="Campaign Title"
            placeholder="e.g. Autonomous Solar Shuttle or 3D Bioprinting Lab Expansion"
            error={errors.title?.message}
            register={register('title', {
              required: 'Campaign title is required',
              minLength: { value: 10, message: 'Title should be at least 10 characters' },
            })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <Dropdown
              label="Category"
              icon={Tag}
              options={CAMPAIGN_CATEGORIES}
              error={errors.category?.message}
              placeholder=""
              register={register('category', {
                required: 'Please select a campaign category',
              })}
            />

            {/* Department */}
            <Dropdown
              label="Department"
              icon={Building2}
              options={DEPARTMENTS}
              error={errors.department?.message}
              placeholder=""
              register={register('department', {
                required: 'Please select department',
              })}
            />
          </div>

          {/* Funding Goal Amount */}
          <Input
            label="Funding Goal (৳ BDT)"
            type="number"
            placeholder="e.g. 15000"
            icon={Banknote}
            error={errors.goalAmount?.message}
            register={register('goalAmount', {
              required: 'Funding goal amount is required',
              min: { value: 1000, message: 'Minimum funding goal is ৳1000' },
              max: { value: 10000000, message: 'Maximum goal is ৳10,000,000' },
            })}
          />

          {/* Description */}
          <Textarea
            label="Campaign Description & Story"
            placeholder="Describe your project goals, why it matters to the university community, and how funds will be spent..."
            rows={5}
            error={errors.description?.message}
            register={register('description', {
              required: 'Campaign description is required',
              minLength: { value: 30, message: 'Description must be at least 30 characters long' },
            })}
          />

          {/* Image Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#1F2937]">
              Campaign Image URL
            </label>
            <Input
              placeholder="https://images.unsplash.com/photo-..."
              icon={ImageIcon}
              error={errors.image?.message}
              register={register('image', {
                required: 'Image URL is required',
              })}
            />

            {/* Preset Recommendation Chips */}
            <div className="space-y-2 pt-1">
              <p className="text-xs text-[#6B7280]">Or pick a recommended stock image:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {presetImages.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setValue('image', preset.url)}
                    className={`p-2 rounded-xl border text-xs font-medium text-left truncate transition-all cursor-pointer ${
                      selectedImage === preset.url
                        ? 'border-[#007979] bg-[#007979]/10 text-[#007979] font-semibold ring-2 ring-[#007979]'
                        : 'border-[#E5E7EB] hover:bg-gray-50 text-[#6B7280]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Image Preview */}
            {selectedImage && (
              <div className="w-full h-40 rounded-2xl overflow-hidden border border-[#E5E7EB] bg-gray-100 mt-2">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = presetImages[0].url;
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="cta"
              size="lg"
              isLoading={loading}
              icon={Sparkles}
            >
              Create Campaign
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
