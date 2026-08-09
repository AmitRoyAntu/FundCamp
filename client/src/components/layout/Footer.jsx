import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Heart, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E5E7EB] mt-16 text-[#6B7280]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#007979] flex items-center justify-center text-white">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-[#007979]">
                Fund<span className="text-[#E37434]">Camp</span>
              </span>
            </Link>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Empowering university innovation, student scholarships, and research initiatives through transparent community crowdfunding.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#1F2937] uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/dashboard" className="hover:text-[#007979] transition-colors">Browse Campaigns</Link></li>
              <li><Link to="/create" className="hover:text-[#007979] transition-colors">Start a Campaign</Link></li>
              <li><Link to="/login" className="hover:text-[#007979] transition-colors">Member Sign In</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#1F2937] uppercase tracking-wider">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/dashboard?category=Research" className="hover:text-[#007979] transition-colors">Research Projects</Link></li>
              <li><Link to="/dashboard?category=Scholarship" className="hover:text-[#007979] transition-colors">Student Scholarships</Link></li>
              <li><Link to="/dashboard?category=Medical" className="hover:text-[#007979] transition-colors">Medical Research</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#1F2937] uppercase tracking-wider">Connect & Support</h4>
            <p className="text-xs text-[#6B7280]">University Student Life & Alumni Network</p>
            <div className="flex items-center gap-3 pt-1">
              <a href="#" className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#007979] hover:text-white transition-colors" aria-label="Github">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#007979] hover:text-white transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#007979] hover:text-white transition-colors" aria-label="Linkedin">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} FundCamp. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-[#DC2626] fill-current inline" /> for students, faculty & alumni.
          </p>
        </div>
      </div>
    </footer>
  );
}
