import React from 'react';

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
          type={type}
          className={`w-full rounded-xl border transition-all duration-200 text-sm bg-white text-[#1F2937] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#24B1B1] ${
            Icon ? 'pl-11' : 'pl-4'
          } pr-4 py-2.5 ${
            error
              ? 'border-[#DC2626] focus:ring-[#DC2626] text-red-900'
              : 'border-[#E5E7EB] hover:border-gray-300'
          } ${className}`}
          {...(register ? register : {})}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-[#DC2626] mt-1 font-medium">{error}</p>}
      {!error && helperText && <p className="text-xs text-[#6B7280] mt-1">{helperText}</p>}
    </div>
  );
}
