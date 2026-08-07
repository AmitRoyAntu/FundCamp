import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import {
  GraduationCap,
  LayoutDashboard,
  PlusCircle,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Create Campaign', path: '/create', icon: PlusCircle, protected: true },
    { name: 'Profile', path: '/profile', icon: User, protected: true },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#007979] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#007979]">
              Camp<span className="text-[#E37434]">Fund</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              if (link.protected && !isAuthenticated) return null;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-[#007979]/10 text-[#007979]'
                      : 'text-[#1F2937] hover:bg-gray-100 hover:text-[#007979]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Auth Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-3 border-l border-[#E5E7EB]">
                <Link to="/profile" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                  <Avatar src={currentUser?.avatar} name={currentUser?.fullName} size="sm" />
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-[#1F2937] leading-none">{currentUser?.fullName}</p>
                    <p className="text-[11px] text-[#6B7280] leading-tight mt-0.5">{currentUser?.userType}</p>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  icon={LogOut}
                  title="Logout"
                  className="text-gray-500 hover:text-red-600"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/register')} icon={Sparkles}>
                  Register
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#1F2937] hover:bg-gray-100 focus:outline-none cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E5E7EB] bg-white px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => {
              if (link.protected && !isAuthenticated) return null;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium ${
                    isActive(link.path)
                      ? 'bg-[#007979]/10 text-[#007979]'
                      : 'text-[#1F2937] hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 text-[#007979]" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#E5E7EB]">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-3">
                  <Avatar src={currentUser?.avatar} name={currentUser?.fullName} size="md" />
                  <div>
                    <p className="font-semibold text-[#1F2937]">{currentUser?.fullName}</p>
                    <p className="text-xs text-[#6B7280]">{currentUser?.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  icon={LogOut}
                  className="w-full justify-center"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full justify-center"
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/register');
                  }}
                  className="w-full justify-center"
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
