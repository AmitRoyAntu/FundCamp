import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({ size = 'md', text = 'Loading...' }) {
  const sizeMap = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3 text-center min-h-[200px]">
      <Loader2 className={`${sizeMap[size]} text-[#007979] animate-spin`} />
      {text && <p className="text-sm font-medium text-[#6B7280]">{text}</p>}
    </div>
  );
}
