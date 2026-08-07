import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { campaignService } from '../../services/campaignService';
import PageHeader from '../../components/common/PageHeader';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Dropdown from '../../components/common/Dropdown';
import CampaignCard from '../../components/campaign/CampaignCard';
import EmptyState from '../../components/common/EmptyState';
import { ProfileSkeleton, CampaignSkeleton } from '../../components/common/Skeleton';
import { DEPARTMENTS } from '../../constants/userTypes';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  IdCard,
  Building2,
  GraduationCap,
  Edit3,
  Calendar,
  Sparkles,
  PlusCircle,
  FolderHeart,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [userCampaigns, setUserCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Profile Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editData, setEditData] = useState({
    fullName: '',
    department: '',
    universityId: '',
  });

  useEffect(() => {
    if (currentUser) {
      setEditData({
        fullName: currentUser.fullName || '',
        department: currentUser.department || '',
        universityId: currentUser.universityId || '',
      });
      fetchUserCampaigns();
    }
  }, [currentUser]);

  const fetchUserCampaigns = async () => {
    setLoading(true);
    try {
      const data = await campaignService.getUserCampaigns(currentUser);
      setUserCampaigns(data);
    } catch (err) {
      console.error('Error fetching user campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await updateProfile(editData);
      toast.success('Profile updated successfully!');
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-8 pb-16 max-w-[1280px] mx-auto">
      <PageHeader
        title="User Profile"
        description="Manage your account profile, university identity, and tracked campaigns."
      >
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          icon={Edit3}
        >
          Edit Profile
        </Button>
      </PageHeader>

      {/* Main Profile Info Card */}
      <Card className="p-8 shadow-sm border border-[#E5E7EB] relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <Avatar
            src={currentUser.avatar}
            name={currentUser.fullName}
            size="xl"
            className="ring-4 ring-[#007979]/20"
          />

          {/* User Details */}
          <div className="space-y-3 text-center md:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-bold text-[#1F2937]">{currentUser.fullName}</h2>
                <p className="text-sm text-[#6B7280]">{currentUser.email}</p>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFE2AF] text-[#8C5B00] self-center md:self-start">
                <GraduationCap className="w-3.5 h-3.5" />
                {currentUser.userType}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-[#E5E7EB] text-sm text-[#1F2937]">
              <div className="flex items-center gap-2.5 bg-[#FFFDF8] p-3 rounded-xl border border-[#E5E7EB]">
                <IdCard className="w-4 h-4 text-[#007979] shrink-0" />
                <div>
                  <p className="text-[11px] text-[#6B7280]">University ID</p>
                  <p className="font-semibold text-xs">{currentUser.universityId}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-[#FFFDF8] p-3 rounded-xl border border-[#E5E7EB]">
                <Building2 className="w-4 h-4 text-[#007979] shrink-0" />
                <div>
                  <p className="text-[11px] text-[#6B7280]">Department</p>
                  <p className="font-semibold text-xs truncate max-w-[180px]">{currentUser.department}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-[#FFFDF8] p-3 rounded-xl border border-[#E5E7EB]">
                <Calendar className="w-4 h-4 text-[#007979] shrink-0" />
                <div>
                  <p className="text-[11px] text-[#6B7280]">Member Since</p>
                  <p className="font-semibold text-xs">{currentUser.joinedDate || '2026-01-10'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Campaigns Created Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-[#1F2937]">My Created Campaigns</h3>
            <p className="text-sm text-[#6B7280]">Fundraising initiatives published under your account</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/create')}
            icon={PlusCircle}
          >
            New Campaign
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <CampaignSkeleton />
            <CampaignSkeleton />
          </div>
        ) : userCampaigns.length === 0 ? (
          <EmptyState
            variant="profile"
            title="No campaigns published yet"
            description="You haven't created any campaigns. Share your research or campus project idea with the university community!"
            actionText="Start a Campaign"
            onAction={() => navigate('/create')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Profile Information"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={editData.fullName}
            onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
            icon={User}
            required
          />

          <Input
            label="University ID"
            value={editData.universityId}
            onChange={(e) => setEditData({ ...editData, universityId: e.target.value })}
            icon={IdCard}
            required
          />

          <Dropdown
            label="Department"
            value={editData.department}
            onChange={(e) => setEditData({ ...editData, department: e.target.value })}
            options={DEPARTMENTS}
            icon={Building2}
            placeholder=""
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={editLoading}
              icon={Sparkles}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
