import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Bell, Timer, Plus } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Overview',
  '/projects': 'Projects',
  '/tasks': 'My Tasks',
  '/kanban': 'Kanban Board',
  '/calendar': 'Calendar',
  '/time-tracking': 'Time Tracking',
  '/analytics': 'Analytics',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
};

export const Topbar: React.FC = () => {
  const { setMobileMenuOpen } = useUIStore();
  const location = useLocation();

  const currentTitle =
    ROUTE_TITLES[location.pathname] ||
    (location.pathname.startsWith('/projects/') ? 'Project Details' : 'Workspace');

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
      {/* Left: Mobile Drawer Button & Active Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-[20px] sm:text-[22px] font-semibold text-slate-900 dark:text-white">
          {currentTitle}
        </h1>
      </div>

      {/* Right: Quick Actions, Timer Status Indicator, Notifications & User Badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to="/time-tracking"
          className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[13px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <Timer className="h-4 w-4 text-[#6366F1]" />
          <span>00:00:00</span>
        </Link>

        <Link
          to="/tasks"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#6366F1] px-3 py-1.5 text-[13px] font-medium text-white shadow-xs hover:bg-[#4F46E5] transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Quick Task</span>
        </Link>

        <Link
          to="/notifications"
          className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#6366F1]" />
        </Link>

        <Link
          to="/settings"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-[13px] font-semibold text-[#4F46E5] dark:bg-indigo-950 dark:text-indigo-300"
          title="Account Settings"
        >
          PF
        </Link>
      </div>
    </header>
  );
};