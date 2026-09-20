import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../common/Loader';
import Button from '../common/Button';
import Card from '../common/Card';
import { ShieldAlert, LogIn, ArrowLeft } from 'lucide-react';

export default function AdminRoute({ children }) {
  const { currentUser, isAuthenticated, isLoading, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (isLoading) {
    return <Loader text="Verifying administrator credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userType = currentUser?.userType || currentUser?.user_type;
  if (userType !== 'Admin') {
    return (
      <div className="max-w-xl mx-auto my-16">
        <Card className="p-8 text-center border-red-200 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Administrator Clearance Required
          </h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            The Document-Verification Queue and Platform Moderation Portal are restricted to university administrators.
            You are currently signed in as <span className="font-semibold text-[#007979]">{currentUser?.fullName}</span> ({userType}).
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              icon={ArrowLeft}
            >
              Return to Dashboard
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                try {
                  await login('admin@university.edu', '12345678');
                } catch {
                  navigate('/login');
                }
              }}
              icon={LogIn}
            >
              Sign In as Admin Demo
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return children;
}
