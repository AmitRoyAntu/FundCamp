import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  PlusCircle,
  User,
  FolderHeart,
  TrendingUp,
  Award,
  Sparkles,
} from 'lucide-react';

export default function Sidebar({ activeCategory, onSelectCategory }) {
  const { isAuthenticated } = useAuth();

  const mainNav = [
    { name: 'Browse All', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Start Campaign', path: '/create', icon: PlusCircle, protected: true },
    { name: 'My Profile', path: '/profile', icon: User, protected: true },
  ];

  const categories = [
    { name: 'All', id: 'All', icon: Sparkles },
    { name: 'Education', id: 'Education', icon: Award },
    { name: 'Medical', id: 'Medical', icon: FolderHeart },
    { name: 'Research', id: 'Research', icon: TrendingUp },
    { name: 'Scholarship', id: 'Scholarship', icon: Award },
    { name: 'Community', id: 'Community', icon: LayoutDashboard },
    { name: 'Environment', id: 'Environment', icon: Sparkles },
  ];

  return (
    <aside className="w-64 bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs space-y-6 shrink-0 hidden lg:block">
      {/* Navigation */}
      <div className="space-y-1">
        <p className="px-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
          Navigation
        </p>
        {mainNav.map((item) => {
          if (item.protected && !isAuthenticated) return null;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#007979] text-white shadow-xs'
                    : 'text-[#1F2937] hover:bg-gray-100 hover:text-[#007979]'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Categories Filter */}
      {onSelectCategory && (
        <div className="space-y-1 pt-4 border-t border-[#E5E7EB]">
          <p className="px-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
            Categories
          </p>
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#FFE2AF] text-[#8C5B00] font-semibold'
                    : 'text-[#6B7280] hover:bg-gray-100 hover:text-[#1F2937]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{cat.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
}
