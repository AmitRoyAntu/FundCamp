import React from 'react';

export default function Avatar({
  src,
  name = 'User',
  size = 'md',
  className = '',
  id,
}) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  };

  return (
    <div
      id={id || `avatar-${Math.random().toString(36).substring(2, 9)}`}
      className={`relative rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-[#007979] text-white font-semibold border-2 border-white shadow-xs ${sizes[size]} ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : null}
      <span className="select-none">{getInitials(name)}</span>
    </div>
  );
}
