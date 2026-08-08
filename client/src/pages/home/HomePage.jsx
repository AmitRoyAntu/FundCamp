import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { campaignService } from '../../services/campaignService';
import CampaignCard from '../../components/campaign/CampaignCard';
import { CampaignSkeleton } from '../../components/common/Skeleton';
import Button from '../../components/common/Button';
import {
  GraduationCap,
  Sparkles,
  Search,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Users,
  Award,
  ArrowRight,
  Heart,
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const campaigns = await campaignService.getFeaturedCampaigns();
        setFeaturedCampaigns(campaigns);
      } catch (err) {
        console.error('Failed to load featured campaigns:', err);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#FFFDF8] via-[#FFE2AF]/30 to-white border border-[#E5E7EB] p-8 sm:p-12 md:p-16 text-center my-4 shadow-sm">
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFE2AF] text-[#8C5B00] text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The #1 University Crowdfunding Network</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1F2937] tracking-tight leading-tight">
            Fund the Future of <br className="hidden sm:inline" />
            <span className="text-[#007979]">University Innovation</span> & Dreams
          </h1>

          <p className="text-base sm:text-lg text-[#6B7280] leading-relaxed max-w-2xl mx-auto">
            CampFund connects ambitious students, visionary faculty, and proud alumni to fund impactful research, scholarships, medical labs, and campus community projects.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="cta"
              size="lg"
              onClick={() => navigate('/dashboard')}
              icon={Search}
              className="w-full sm:w-auto"
            >
              Browse Campaigns
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/create')}
              icon={Sparkles}
              className="w-full sm:w-auto"
            >
              Start a Campaign
            </Button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[#E5E7EB]/80 max-w-lg mx-auto">
            <div>
              <p className="text-2xl font-extrabold text-[#007979]">৳150K+</p>
              <p className="text-xs text-[#6B7280] font-medium mt-0.5">Funds Raised</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#007979]">120+</p>
              <p className="text-xs text-[#6B7280] font-medium mt-0.5">Active Projects</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#007979]">98%</p>
              <p className="text-xs text-[#6B7280] font-medium mt-0.5">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#E37434] uppercase tracking-wider">Spotlight</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2937]">Featured Campaigns</h2>
            <p className="text-sm text-[#6B7280] mt-1">High-impact university initiatives needing your support</p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm font-semibold text-[#007979] hover:underline"
          >
            Explore all campaigns <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CampaignSkeleton />
            <CampaignSkeleton />
            <CampaignSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </section>

      {/* Why CampFund Section */}
      <section className="bg-white rounded-3xl border border-[#E5E7EB] p-8 sm:p-12 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#007979] uppercase tracking-wider">Why CampFund</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2937]">Built Specifically for Academia</h2>
          <p className="text-sm text-[#6B7280]">
            Unlike generic crowdfunding platforms, CampFund verifies university affiliations and ensures transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3 p-6 rounded-2xl bg-[#FFFDF8] border border-[#E5E7EB]">
            <div className="w-12 h-12 rounded-xl bg-[#007979]/10 text-[#007979] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#1F2937]">Verified University IDs</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Every campaign creator is authenticated using official university student, faculty, or alumni credentials.
            </p>
          </div>

          <div className="space-y-3 p-6 rounded-2xl bg-[#FFFDF8] border border-[#E5E7EB]">
            <div className="w-12 h-12 rounded-xl bg-[#24B1B1]/10 text-[#24B1B1] flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#1F2937]">Alumni & Student Synergy</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Alumni give back directly to their departmental alma mater, backing student research and lab gear.
            </p>
          </div>

          <div className="space-y-3 p-6 rounded-2xl bg-[#FFFDF8] border border-[#E5E7EB]">
            <div className="w-12 h-12 rounded-xl bg-[#E37434]/10 text-[#E37434] flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#1F2937]">Zero Overhead Hidden Fees</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Direct peer-to-peer educational support with transparent milestone tracking and open financial reports.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#E37434] uppercase tracking-wider">How It Works</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2937]">Launch in 3 Simple Steps</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] space-y-3 relative">
            <span className="w-8 h-8 rounded-full bg-[#007979] text-white flex items-center justify-center font-bold text-sm">
              1
            </span>
            <h3 className="text-lg font-bold text-[#1F2937]">Register & Verify</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Sign up with your university email, ID, and department role as Student, Faculty, or Alumni.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] space-y-3 relative">
            <span className="w-8 h-8 rounded-full bg-[#24B1B1] text-white flex items-center justify-center font-bold text-sm">
              2
            </span>
            <h3 className="text-lg font-bold text-[#1F2937]">Create Campaign</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Define your funding goal, detail project objectives, upload project media, and publish to campus.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] space-y-3 relative">
            <span className="w-8 h-8 rounded-full bg-[#E37434] text-white flex items-center justify-center font-bold text-sm">
              3
            </span>
            <h3 className="text-lg font-bold text-[#1F2937]">Rally Campus Support</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Share across departments, gather contributions, and post milestone updates as your project thrives.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="rounded-3xl bg-[#007979] text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold">Have an idea or research project?</h2>
          <p className="text-emerald-100 text-sm sm:text-base max-w-xl">
            Turn your vision into reality. Start raising funds today with the support of your campus community.
          </p>
        </div>
        <Button
          variant="cta"
          size="lg"
          onClick={() => navigate('/create')}
          icon={Sparkles}
          className="shrink-0"
        >
          Start Your Campaign Now
        </Button>
      </section>
    </div>
  );
}
