import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({
  label,
  error,
  helperText,
  icon: Icon,
  type = 'text',
  id,
  className = '',
  register,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const actualType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const inputId = id || `input-${label ? label.toLowerCase().replace(/\s+/g, '-') : Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[#1F2937]">
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-xs">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          id={inputId}
          type={actualType}
          className={`w-full rounded-xl border transition-all duration-200 text-sm bg-white text-[#1F2937] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#24B1B1] ${
            Icon ? 'pl-11' : 'pl-4'
          } ${isPassword ? 'pr-11' : 'pr-4'} py-2.5 ${
            error
              ? 'border-[#DC2626] focus:ring-[#DC2626] text-red-900'
              : 'border-[#E5E7EB] hover:border-gray-300'
          } ${className}`}
          {...(register ? register : {})}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6B7280] hover:text-[#1F2937] transition-colors focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-[#DC2626] mt-1 font-medium">{error}</p>}
      {!error && helperText && <p className="text-xs text-[#6B7280] mt-1">{helperText}</p>}
    </div>
  );
}
