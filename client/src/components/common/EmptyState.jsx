import React from 'react';
import Button from './Button';
import { FolderOpen, SearchX, UserX, Sparkles } from 'lucide-react';

export default function EmptyState({
  icon: Icon = FolderOpen,
  title = 'No items found',
  description = 'There are no items matching your criteria at this time.',
  actionText,
  onAction,
  variant = 'default', // default | search | profile
  id = 'empty-state'
}) {
  const iconVariants = {
    default: FolderOpen,
    search: SearchX,
    profile: UserX,
  };

  const ActiveIcon = iconVariants[variant] || Icon;

  return (
    <div
      id={id}
      className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-[#E5E7EB] my-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-[#FFE2AF]/50 flex items-center justify-center text-[#E37434] mb-4 shadow-xs">
        <ActiveIcon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-[#1F2937] mb-1">{title}</h3>
      <p className="text-sm text-[#6B7280] max-w-md mb-6">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction} icon={Sparkles}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
