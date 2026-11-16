import React from 'react';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  Link,
} from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { FolderKanban, CheckSquare, Clock, AlertCircle } from 'lucide-react';

// Initial Dashboard Overview View (Akan dihubungkan ke real database di Fase 2 & 3)
const DashboardFoundationView: React.FC = () => {
  const stats = [
    { label: 'Total Projects', value: '0', icon: FolderKanban, color: 'text-[#6366F1]' },
    { label: 'Pending Tasks', value: '0', icon: CheckSquare, color: 'text-[#3B82F6]' },
    { label: 'Overdue Tasks', value: '0', icon: AlertCircle, color: 'text-[#EF4444]' },
    { label: 'Tracked Hours', value: '0.0h', icon: Clock, color: 'text-[#16A34A]' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-[20px] font-semibold text-slate-900 dark:text-white">
            Welcome to ProjectFlow
          </h2>
          <p className="text-[14px] text-slate-500 dark:text-slate-400">
            Plan Smarter. Work Better. Track Everything.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
                  {stat.label}
                </span>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="mt-3 text-[26px] font-bold text-slate-900 dark:text-white">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-[16px] font-semibold text-slate-900 dark:text-white">
          Phase 1 Foundation Active
        </h3>
        <p className="mx-auto mt-1 max-w-md text-[14px] text-slate-500 dark:text-slate-400">
          Layout shell, responsive sidebar, routing structure, and state providers are configured. Ready for Phase 2 (Supabase Database & Auth).
        </p>
      </div>
    </div>
  );
};

const ModuleReadyView: React.FC<{ title: string; phase: string }> = ({
  title,
  phase,
}) => (
  <div className="rounded-xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
    <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white">
      {title}
    </h2>
    <p className="mt-1 text-[14px] text-slate-500 dark:text-slate-400">
      Route is registered and connected to the main layout. Full database logic will be implemented in {phase}.
    </p>
  </div>
);

const NotFoundView: React.FC = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] p-4 text-center dark:bg-[#0F172A]">
    <h1 className="text-[30px] font-bold text-slate-900 dark:text-white">404</h1>
    <p className="mt-2 text-[14px] text-slate-600 dark:text-slate-400">
      The page you are looking for does not exist.
    </p>
    <Link
      to="/dashboard"
      className="mt-4 rounded-lg bg-[#6366F1] px-4 py-2 text-[14px] font-medium text-white hover:bg-[#4F46E5]"
    >
      Back to Dashboard
    </Link>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <ModuleReadyView title="Authentication – Login" phase="Phase 2" />,
  },
  {
    path: '/register',
    element: <ModuleReadyView title="Authentication – Register" phase="Phase 2" />,
  },
  {
    path: '/forgot-password',
    element: <ModuleReadyView title="Authentication – Forgot Password" phase="Phase 2" />,
  },
  {
    element: <DashboardLayout />,
    children: [
      { path: '/dashboard', element: <DashboardFoundationView /> },
      { path: '/projects', element: <ModuleReadyView title="Projects Module" phase="Phase 3" /> },
      { path: '/projects/:id', element: <ModuleReadyView title="Project Detail" phase="Phase 3" /> },
      { path: '/tasks', element: <ModuleReadyView title="Tasks Module" phase="Phase 3" /> },
      { path: '/kanban', element: <ModuleReadyView title="Kanban Board" phase="Phase 4" /> },
      { path: '/calendar', element: <ModuleReadyView title="Calendar View" phase="Phase 4" /> },
      { path: '/time-tracking', element: <ModuleReadyView title="Time Tracking" phase="Phase 4" /> },
      { path: '/analytics', element: <ModuleReadyView title="Productivity Analytics" phase="Phase 5" /> },
      { path: '/notifications', element: <ModuleReadyView title="Real-Time Notifications" phase="Phase 5" /> },
      { path: '/settings', element: <ModuleReadyView title="User Settings" phase="Phase 5" /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundView />,
  },
]);

export const AppRouter: React.FC = () => <RouterProvider router={router} />;