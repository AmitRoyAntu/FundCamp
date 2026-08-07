import React from 'react';

export default function PageHeader({ title, description, children, badge }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5E7EB] mb-8">
      <div className="space-y-1">
        {badge && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFE2AF] text-[#8C5B00] mb-2">
            {badge}
          </span>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937] tracking-tight">{title}</h1>
        {description && <p className="text-sm text-[#6B7280]">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-3 shrink-0">{children}</div>}
    </div>
  );
}
