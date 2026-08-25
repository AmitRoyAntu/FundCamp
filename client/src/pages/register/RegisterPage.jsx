import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Dropdown from '../../components/common/Dropdown';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import { USER_TYPES, DEPARTMENTS } from '../../constants/userTypes';
import { MALE_AVATAR, FEMALE_AVATAR, PRESET_AVATARS } from '../../constants/avatars';
import toast from 'react-hot-toast';
import {
  GraduationCap,
  User,
  Mail,
  Lock,
  Building2,
  IdCard,
  Sparkles,
  Camera,
  Upload,
  Trash2,
  Check,
} from 'lucide-react';

export default function RegisterPage() {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(MALE_AVATAR);
  const [selectedType, setSelectedType] = useState('male'); // 'male' | 'female' | 'custom'
  const [avatarName, setAvatarName] = useState('');
  const fileInputRef = useRef(null);

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
  const fullNameValue = watch('fullName');

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size cannot be larger than 10MB. Please choose a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target.result;
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 400;
        let width = img.width;
        let height = img.height;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const compressed = canvas.toDataURL(mimeType, 0.9);
        setAvatar(compressed);
        setSelectedType('custom');
        setAvatarName(file.name);
        toast.success(`Photo "${file.name}" attached!`);
      };
      img.onerror = () => {
        setAvatar(rawDataUrl);
        setSelectedType('custom');
        setAvatarName(file.name);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const selectPreset = (type, url) => {
    setAvatar(url);
    setSelectedType(type);
    setAvatarName('');
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerAuth({
        ...data,
        avatar,
      });
      toast.success('Registration successful! Welcome to FundCamp.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <Card className="w-full max-w-xl p-6 sm:p-8 shadow-md border border-[#E5E7EB]">
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#007979] text-white mx-auto shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Create Your FundCamp Account</h1>
          <p className="text-sm text-[#6B7280]">
            Join students, faculty, and alumni supporting university innovation.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Profile Picture Selection Section */}
          <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200 space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-800">
                Profile Photo (Optional)
              </label>
              <span className="text-[11px] text-gray-500">Max 10MB</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* Avatar Live Preview */}
              <div
                className="relative group cursor-pointer shrink-0"
                onClick={() => fileInputRef.current?.click()}
                title="Click to upload custom photo"
              >
                <Avatar
                  src={avatar}
                  name={fullNameValue || 'User'}
                  size="xl"
                  className="ring-2 ring-gray-200 shadow-xs"
                />
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-2xs">
                  <Camera className="w-5 h-5" />
                </div>
              </div>

              {/* Primary: Upload Button & File Info */}
              <div className="space-y-3 flex-1 min-w-0 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-xs font-semibold text-gray-800 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-gray-600" />
                    <span>{avatarName ? 'Change Uploaded Photo' : 'Upload Photo'}</span>
                  </button>

                  {avatarName && (
                    <button
                      type="button"
                      onClick={() => selectPreset('male', MALE_AVATAR)}
                      className="p-1.5 text-gray-400 hover:text-red-600 cursor-pointer transition-colors"
                      title="Reset to default logo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-gray-500">
                  Supports PNG, JPG, WebP • File size cannot be larger than 10MB
                </p>

                {/* Secondary Option: Just the Male & Female Logo Icons (No Titles) */}
                <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-2 border-t border-gray-200/80">
                  <span className="text-[11px] text-gray-500 font-medium">Or choose avatar:</span>
                  <div className="flex items-center gap-2">
                    {/* Male Logo Thumbnail Only */}
                    <button
                      type="button"
                      onClick={() => selectPreset('male', MALE_AVATAR)}
                      title="Male Avatar"
                      className={`relative p-0.5 rounded-full transition-all cursor-pointer ${
                        selectedType === 'male' && avatar === MALE_AVATAR
                          ? 'ring-2 ring-gray-900 scale-110 shadow-xs'
                          : 'opacity-60 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      <img src={MALE_AVATAR} alt="Male Avatar" className="w-7 h-7 rounded-full object-cover" />
                    </button>

                    {/* Female Logo Thumbnail Only */}
                    <button
                      type="button"
                      onClick={() => selectPreset('female', FEMALE_AVATAR)}
                      title="Female Avatar"
                      className={`relative p-0.5 rounded-full transition-all cursor-pointer ${
                        selectedType === 'female' && avatar === FEMALE_AVATAR
                          ? 'ring-2 ring-gray-900 scale-110 shadow-xs'
                          : 'opacity-60 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      <img src={FEMALE_AVATAR} alt="Female Avatar" className="w-7 h-7 rounded-full object-cover" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
