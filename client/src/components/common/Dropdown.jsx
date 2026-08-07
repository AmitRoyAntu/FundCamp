import React from 'react';

export default function Dropdown({
  label,
  options = [],
  error,
  helperText,
  icon: Icon,
  id,
  className = '',
  register,
  placeholder = 'Select an option',
  ...props
}) {
  const selectId = id || `select-${label ? label.toLowerCase().replace(/\s+/g, '-') : Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-[#1F2937]">
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-xs">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <select
          id={selectId}
          className={`w-full rounded-xl border transition-all duration-200 text-sm bg-white text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#24B1B1] ${
            Icon ? 'pl-11' : 'pl-4'
          } pr-10 py-2.5 appearance-none cursor-pointer ${
            error
              ? 'border-[#DC2626] focus:ring-[#DC2626]'
              : 'border-[#E5E7EB] hover:border-gray-300'
          } ${className}`}
          {...(register ? register : {})}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.id || opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label || opt.name : opt;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#6B7280]">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
      {error && <p className="text-xs text-[#DC2626] mt-1 font-medium">{error}</p>}
      {!error && helperText && <p className="text-xs text-[#6B7280] mt-1">{helperText}</p>}
    </div>
  );
}
