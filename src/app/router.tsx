import React from 'react';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  Link,
} from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { ProtectedRoute, PublicOnlyRoute } from '@/features/auth/RouteGuards';
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
} from '@/features/auth/AuthPages';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import {
  ProjectsPage,
  ProjectDetailPage,
} from '@/features/projects/ProjectsPages';
import { TasksPage } from '@/features/tasks/TasksPage';
import { SettingsPage } from '@/features/settings/SettingsPage';

const ModuleReadyView: React.FC<{ title: string; phase: string }> = ({
  title,
  phase,
}) => (
  <div className="rounded-xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
    <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white">
      {title}
    </h2>
    <p className="mt-1 text-[14px] text-slate-500 dark:text-slate-400">
      Full interactive functionality for this module will be implemented in {phase}.
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
    element: <PublicOnlyRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/projects', element: <ProjectsPage /> },
          { path: '/projects/:id', element: <ProjectDetailPage /> },
          { path: '/tasks', element: <TasksPage /> },
          { path: '/kanban', element: <ModuleReadyView title="Kanban Board" phase="Phase 4" /> },
          { path: '/calendar', element: <ModuleReadyView title="Calendar View" phase="Phase 4" /> },
          { path: '/time-tracking', element: <ModuleReadyView title="Time Tracking" phase="Phase 4" /> },
          { path: '/analytics', element: <ModuleReadyView title="Productivity Analytics" phase="Phase 5" /> },
          { path: '/notifications', element: <ModuleReadyView title="Real-Time Notifications" phase="Phase 5" /> },
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundView />,
  },
]);

export const AppRouter: React.FC = () => <RouterProvider router={router} />;