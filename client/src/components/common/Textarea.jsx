import React from 'react';

export default function Textarea({
  label,
  error,
  helperText,
  rows = 4,
  id,
  className = '',
  register,
  ...props
}) {
  const textareaId = id || `textarea-${label ? label.toLowerCase().replace(/\s+/g, '-') : Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-[#1F2937]">
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-xs">
        <textarea
          id={textareaId}
          rows={rows}
          className={`w-full rounded-xl border transition-all duration-200 text-sm bg-white text-[#1F2937] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#24B1B1] px-4 py-2.5 ${
            error
              ? 'border-[#DC2626] focus:ring-[#DC2626]'
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
