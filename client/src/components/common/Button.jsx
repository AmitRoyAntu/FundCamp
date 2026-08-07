import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  icon: Icon,
  iconPosition = 'left',
  type = 'button',
  onClick,
  className = '',
  id,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const variants = {
    primary: 'bg-[#007979] text-white hover:bg-[#006363] focus:ring-[#007979] shadow-sm hover:shadow-md active:scale-[0.99]',
    secondary: 'bg-[#24B1B1] text-white hover:bg-[#1ea0a0] focus:ring-[#24B1B1] shadow-sm hover:shadow-md active:scale-[0.99]',
    cta: 'bg-[#E37434] text-white hover:bg-[#cb6225] focus:ring-[#E37434] shadow-sm hover:shadow-md active:scale-[0.99]',
    outline: 'border border-[#007979] text-[#007979] bg-transparent hover:bg-[#007979]/10 focus:ring-[#007979]',
    ghost: 'text-[#1F2937] bg-transparent hover:bg-gray-100 focus:ring-gray-300',
    danger: 'bg-[#DC2626] text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
    disabled: 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  const activeVariant = isDisabled || isLoading ? variants.disabled : variants[variant];

  return (
    <button
      id={id || `btn-${Math.random().toString(36).substring(2, 9)}`}
      type={type}
      disabled={isDisabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${activeVariant} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 text-current shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 text-current shrink-0" />}
        </>
      )}
    </button>
  );
}
