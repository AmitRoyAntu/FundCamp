import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/home/HomePage';
import LoginPage from '../pages/login/LoginPage';
import RegisterPage from '../pages/register/RegisterPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import CampaignDetailPage from '../pages/campaign/CampaignDetailPage';
import CreateCampaignPage from '../pages/createCampaign/CreateCampaignPage';
import ProfilePage from '../pages/profile/ProfilePage';
import NotFoundPage from '../pages/notFound/NotFoundPage';
import ProtectedRoute from '../components/common/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/campaign/:id" element={<CampaignDetailPage />} />

      {/* Protected Routes requiring authenticated user session */}
      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <CreateCampaignPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* 404 Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
