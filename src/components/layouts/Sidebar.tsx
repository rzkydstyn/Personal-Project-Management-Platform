import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Columns3,
  Calendar,
  Clock,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Layers,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/useUIStore';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'My Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Kanban Board', href: '/kanban', icon: Columns3 },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Time Tracking', href: '/time-tracking', icon: Clock },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const {
    isSidebarCollapsed,
    toggleSidebar,
    isMobileMenuOpen,
    setMobileMenuOpen,
  } = useUIStore();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-all duration-200 ease-in-out lg:static',
          isSidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-64',
          isMobileMenuOpen
            ? 'translate-x-0 w-64'
            : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#6366F1] text-white shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
            {(!isSidebarCollapsed || isMobileMenuOpen) && (
              <div className="flex flex-col">
                <span className="text-[16px] font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  ProjectFlow
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Personal Workspace
                </span>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                title={isSidebarCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors',
                    isActive
                      ? 'bg-[#6366F1]/10 text-[#6366F1] dark:bg-[#6366F1]/20 dark:text-indigo-400'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
                    isSidebarCollapsed && !isMobileMenuOpen && 'justify-center px-2'
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {(!isSidebarCollapsed || isMobileMenuOpen) && (
                  <span className="truncate">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse Toggle Footer (Desktop Only) */}
        <div className="hidden border-t border-slate-200 dark:border-slate-800 p-3 lg:block">
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};