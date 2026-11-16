import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

export const ProtectedRoute: React.FC = () => {
  const { user, isInitialized } = useAuthStore();
  const location = useLocation();

  if (!isInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#6366F1]" />
          <p className="text-[13px] font-medium text-slate-500">
            Restoring workspace session...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export const PublicOnlyRoute: React.FC = () => {
  const { user, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]">
        <Loader2 className="h-8 w-8 animate-spin text-[#6366F1]" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};