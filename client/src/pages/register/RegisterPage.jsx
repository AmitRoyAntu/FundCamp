import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Dropdown from '../../components/common/Dropdown';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { USER_TYPES, DEPARTMENTS } from '../../constants/userTypes';
import toast from 'react-hot-toast';
import {
  GraduationCap,
  User,
  Mail,
  Lock,
  Building2,
  IdCard,
  Sparkles,
} from 'lucide-react';

export default function RegisterPage() {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      universityId: '',
      department: 'Computer Science & Engineering',
      userType: 'Student',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerAuth(data);
      toast.success('Registration successful! Welcome to CampFund.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <Card className="w-full max-w-xl p-8 shadow-md border border-[#E5E7EB]">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#007979] text-white mx-auto shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Create Your CampFund Account</h1>
          <p className="text-sm text-[#6B7280]">
            Join students, faculty, and alumni supporting university innovation.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name */}
          <Input
            label="Full Name"
            placeholder="e.g. Dr. Sarah Jenkins or Alex Rivera"
            icon={User}
            error={errors.fullName?.message}
            register={register('fullName', {
              required: 'Full name is required',
              minLength: { value: 3, message: 'Name must be at least 3 characters' },
            })}
          />

          {/* Email */}
          <Input
            label="University Email"
            type="email"
            placeholder="e.g. s.jenkins@university.edu"
            icon={Mail}
            error={errors.email?.message}
            register={register('email', {
              required: 'University email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* University ID */}
            <Input
              label="University ID"
              placeholder="e.g. STU-2024-8832"
              icon={IdCard}
              error={errors.universityId?.message}
              register={register('universityId', {
                required: 'University ID is required',
              })}
            />

            {/* User Type */}
            <Dropdown
              label="User Type"
              icon={GraduationCap}
              options={USER_TYPES}
              error={errors.userType?.message}
              placeholder=""
              register={register('userType', {
                required: 'User type is required',
              })}
            />
          </div>

          {/* Department */}
          <Dropdown
            label="Department"
            icon={Building2}
            options={DEPARTMENTS}
            error={errors.department?.message}
            placeholder=""
            register={register('department', {
              required: 'Department selection is required',
            })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              error={errors.password?.message}
              register={register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
              })}
            />

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              error={errors.confirmPassword?.message}
              register={register('confirmPassword', {
                required: 'Please confirm password',
                validate: (val) => val === passwordValue || 'Passwords do not match',
              })}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            icon={Sparkles}
            className="w-full justify-center mt-6"
          >
            Create Account
          </Button>

          <div className="text-center pt-4 border-t border-[#E5E7EB]">
            <p className="text-sm text-[#6B7280]">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[#007979] hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}
