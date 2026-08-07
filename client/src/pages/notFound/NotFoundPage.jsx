import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { Home, Compass, AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 my-8">
      <div className="w-24 h-24 rounded-3xl bg-[#FFE2AF]/60 flex items-center justify-center text-[#E37434] mb-6 shadow-sm animate-bounce">
        <Compass className="w-12 h-12" />
      </div>

      <h1 className="text-4xl font-extrabold text-[#1F2937] tracking-tight mb-2">404 - Page Not Found</h1>
      <p className="text-base text-[#6B7280] max-w-md mb-8 leading-relaxed">
        Oops! The page or campaign view you are looking for doesn't exist, may have moved, or is temporarily unavailable.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="primary" size="lg" onClick={() => navigate('/')} icon={Home}>
          Back to Home
        </Button>
        <Button variant="outline" size="lg" onClick={() => navigate('/dashboard')}>
          Explore Campaigns
        </Button>
      </div>
    </div>
  );
}
