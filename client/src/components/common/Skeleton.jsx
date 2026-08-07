import React from 'react';

export function CampaignSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 animate-pulse flex flex-col gap-4">
      <div className="w-full h-48 bg-gray-200 rounded-xl" />
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-200 rounded-md w-1/4" />
        <div className="h-4 bg-gray-200 rounded-md w-1/5" />
      </div>
      <div className="h-6 bg-gray-200 rounded-md w-3/4" />
      <div className="h-4 bg-gray-200 rounded-md w-full" />
      <div className="h-4 bg-gray-200 rounded-md w-5/6" />
      <div className="space-y-2 pt-2">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded-md w-1/3" />
          <div className="h-4 bg-gray-200 rounded-md w-1/4" />
        </div>
        <div className="w-full bg-gray-200 h-2.5 rounded-full" />
      </div>
      <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
        <div className="w-9 h-9 bg-gray-200 rounded-full shrink-0" />
        <div className="space-y-1 w-full">
          <div className="h-3.5 bg-gray-200 rounded-md w-1/2" />
          <div className="h-3 bg-gray-200 rounded-md w-1/3" />
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 animate-pulse space-y-6">
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 bg-gray-200 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="h-6 bg-gray-200 rounded-md w-1/3" />
          <div className="h-4 bg-gray-200 rounded-md w-1/4" />
          <div className="h-4 bg-gray-200 rounded-md w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div className="h-12 bg-gray-200 rounded-xl" />
        <div className="h-12 bg-gray-200 rounded-xl" />
        <div className="h-12 bg-gray-200 rounded-xl" />
        <div className="h-12 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8 space-y-8 animate-pulse">
      <div className="h-10 bg-gray-200 rounded-xl w-1/3" />
      <div className="h-4 bg-gray-200 rounded-xl w-1/2" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <CampaignSkeleton />
        <CampaignSkeleton />
        <CampaignSkeleton />
      </div>
    </div>
  );
}

export default function Skeleton({ className = '' }) {
  return <div className={`bg-gray-200 animate-pulse rounded-xl ${className}`} />;
}
