import React from 'react';

export default function Card({
  children,
  className = '',
  hoverable = true,
  onClick,
  id,
  ...props
}) {
  return (
    <div
      id={id || `card-${Math.random().toString(36).substring(2, 9)}`}
      onClick={onClick}
      className={`bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6 transition-all duration-300 ${
        hoverable ? 'hover:shadow-md hover:-translate-y-0.5 hover:border-[#24B1B1]/40' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
