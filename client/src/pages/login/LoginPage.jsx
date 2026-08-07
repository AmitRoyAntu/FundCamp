import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import toast from 'react-hot-toast';
import {
  GraduationCap,
  Mail,
  Lock,
  LogIn,
  UserCheck,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: 'sarah.j@university.edu',
      password: '12345678',
      rememberMe: true,
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back to CampFund!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (email) => {
    setValue('email', email);
    setValue('password', '12345678');
    handleSubmit(onSubmit)();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <Card className="w-full max-w-md p-8 shadow-md border border-[#E5E7EB]">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#007979] text-white mx-auto shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Sign In to CampFund</h1>
          <p className="text-sm text-[#6B7280]">Access your university crowdfunding workspace.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. alex.rivera@student.university.edu"
            icon={Mail}
            error={errors.email?.message}
            register={register('email', {
              required: 'Email address is required',
            })}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.password?.message}
            register={register('password', {
              required: 'Password is required',
            })}
          />

          <div className="flex items-center justify-between text-xs sm:text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-[#6B7280]">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-[#007979] focus:ring-[#24B1B1]"
                {...register('rememberMe')}
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              disabled
              className="text-[#6B7280] opacity-60 cursor-not-allowed hover:none"
              title="Forgot Password is disabled in MVP demo release"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            icon={LogIn}
            className="w-full justify-center"
          >
            Sign In
          </Button>

          {/* Quick Demo Login Preset Buttons */}
          <div className="pt-4 border-t border-[#E5E7EB] space-y-2">
            <p className="text-xs text-center text-[#6B7280] font-semibold uppercase tracking-wider">
              Quick Demo Login
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('sarah.j@university.edu')}
                className="px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] text-xs font-medium text-[#1F2937] hover:bg-[#FFE2AF]/40 transition-colors flex items-center justify-center gap-1"
              >
                <UserCheck className="w-3 h-3 text-[#007979]" /> Student
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('r.chen@university.edu')}
                className="px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] text-xs font-medium text-[#1F2937] hover:bg-[#FFE2AF]/40 transition-colors flex items-center justify-center gap-1"
              >
                <UserCheck className="w-3 h-3 text-[#007979]" /> Faculty
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('marcus.vance@alumni.university.edu')}
                className="px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] text-xs font-medium text-[#1F2937] hover:bg-[#FFE2AF]/40 transition-colors flex items-center justify-center gap-1"
              >
                <UserCheck className="w-3 h-3 text-[#007979]" /> Alumni
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-sm text-[#6B7280]">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-[#007979] hover:underline">
                Register now
              </Link>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}
