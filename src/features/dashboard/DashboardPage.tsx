import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, subDays, isSameDay } from 'date-fns';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ListTodo,
  Activity,
  Bell,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProjects } from '@/features/projects/useProjects';
import { useTasks } from '@/features/tasks/useTasks';
import { ProjectFormModal } from '@/features/projects/ProjectFormModal';
import { TaskFormModal } from '@/features/tasks/TaskModals';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const PIE_COLORS = ['#64748B', '#3B82F6', '#F59E0B', '#16A34A'];

export const DashboardPage: React.FC = () => {
  const { profile, user } = useAuthStore();
  const { data: projects = [], isLoading: loadingProjects } = useProjects();
  const { data: tasks = [], isLoading: loadingTasks } = useTasks();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  const metrics = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === 'active').length;
    const completedProjects = projects.filter(
      (p) => p.status === 'completed'
    ).length;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'done').length;
    const pendingTasks = totalTasks - completedTasks;
    const now = new Date();
    const overdueTasks = tasks.filter(
      (t) =>
        t.status !== 'done' &&
        t.due_date !== null &&
        new Date(t.due_date) < now
    ).length;

    const totalTrackedSeconds = tasks.reduce(
      (acc, t) => acc + t.trackedSeconds,
      0
    );
    const totalTrackedHours = (totalTrackedSeconds / 3600).toFixed(1);

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      totalTrackedHours,
    };
  }, [projects, tasks]);

  // Weekly Productivity Data (Last 7 days task completions)
  const weeklyChartData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, idx) => {
      const day = subDays(new Date(), 6 - idx);
      const completedCount = tasks.filter(
        (t) =>
          t.status === 'done' &&
          t.completed_at &&
          isSameDay(new Date(t.completed_at), day)
      ).length;
      return {
        day: format(day, 'EEE'),
        completed: completedCount,
      };
    });
  }, [tasks]);

  // Task Status Distribution
  const statusDistribution = useMemo(() => {
    return [
      { name: 'Todo', value: tasks.filter((t) => t.status === 'todo').length },
      {
        name: 'In Progress',
        value: tasks.filter((t) => t.status === 'in_progress').length,
      },
      {
        name: 'Review',
        value: tasks.filter((t) => t.status === 'review').length,
      },
      { name: 'Done', value: tasks.filter((t) => t.status === 'done').length },
    ];
  }, [tasks]);

  const upcomingDeadlines = useMemo(() => {
    return tasks
      .filter((t) => t.status !== 'done' && t.due_date)
      .sort(
        (a, b) =>
          new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
      )
      .slice(0, 5);
  }, [tasks]);

  if (loadingProjects || loadingTasks) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-[#6366F1]" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Projects', value: metrics.totalProjects, icon: FolderKanban, color: 'text-[#6366F1]' },
    { label: 'Active Projects', value: metrics.activeProjects, icon: Activity, color: 'text-[#3B82F6]' },
    { label: 'Completed Projects', value: metrics.completedProjects, icon: CheckCircle2, color: 'text-[#16A34A]' },
    { label: 'Total Tasks', value: metrics.totalTasks, icon: ListTodo, color: 'text-[#6366F1]' },
    { label: 'Completed Tasks', value: metrics.completedTasks, icon: CheckCircle2, color: 'text-[#16A34A]' },
    { label: 'Pending Tasks', value: metrics.pendingTasks, icon: Clock, color: 'text-[#F59E0B]' },
    { label: 'Overdue Tasks', value: metrics.overdueTasks, icon: AlertCircle, color: 'text-[#EF4444]' },
    { label: 'Tracked Hours', value: `${metrics.totalTrackedHours}h`, icon: Clock, color: 'text-[#16A34A]' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Actions */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-[22px] font-bold text-slate-900 dark:text-white">
            Welcome back, {profile?.full_name || user?.email}
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            Plan Smarter. Work Better. Track Everything.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsNewProjectOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </button>
          <button
            type="button"
            onClick={() => setIsNewTaskOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#6366F1] px-3.5 py-2 text-[13px] font-medium text-white shadow-xs hover:bg-[#4F46E5]"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* 8 Summary Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
                  {card.label}
                </span>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <p className="mt-2 text-[22px] font-bold text-slate-900 dark:text-white">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Weekly Task Completion Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">
            Weekly Task Completion (Last 7 Days)
          </h3>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData}>
                <XAxis dataKey="day" fontSize={12} stroke="#64748B" />
                <YAxis allowDecimals={false} fontSize={12} stroke="#64748B" />
                <Tooltip />
                <Bar dataKey="completed" fill="#6366F1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Status Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">
            Task Status Distribution
          </h3>
          {tasks.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-[13px] text-slate-400">
              No tasks recorded yet.
            </div>
          ) : (
            <div className="mt-4 flex h-64 flex-col items-center justify-center sm:flex-row">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {statusDistribution.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 sm:flex-col">
                {statusDistribution.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-2 text-[12px]">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[idx] }}
                    />
                    <span className="text-slate-600 dark:text-slate-300">
                      {item.name}: <strong>{item.value}</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid: Active Project Progress, Upcoming Deadlines & Recent Notifications */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Project Progress Cards */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">
              Project Progress
            </h3>
            <Link
              to="/projects"
              className="text-[12px] font-medium text-[#6366F1] hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-4">
            {projects.length === 0 ? (
              <p className="text-[13px] text-slate-400">No projects created yet.</p>
            ) : (
              projects.slice(0, 4).map((p) => (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[13px]">
                    <Link
                      to={`/projects/${p.id}`}
                      className="font-medium text-slate-800 hover:text-[#6366F1] dark:text-slate-200"
                    >
                      {p.name}
                    </Link>
                    <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">
                      {p.progress}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${p.progress}%`,
                        backgroundColor: p.color,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">
              Upcoming Deadlines
            </h3>
            <Link
              to="/tasks"
              className="text-[12px] font-medium text-[#6366F1] hover:underline"
            >
              All tasks
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-[13px] text-slate-400">
                No pending deadlines scheduled.
              </p>
            ) : (
              upcomingDeadlines.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5 text-[13px] dark:border-slate-800"
                >
                  <div className="truncate pr-2">
                    <p className="truncate font-medium text-slate-800 dark:text-slate-200">
                      {t.title}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {t.project?.name || 'Workspace'}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {format(new Date(t.due_date!), 'dd MMM')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity / Notifications */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">
              Recent Notifications
            </h3>
            <Bell className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-4 space-y-3">
            {notifications.length === 0 ? (
              <p className="text-[13px] text-slate-400">No recent notifications.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="rounded-lg border border-slate-100 p-2.5 text-[12px] dark:border-slate-800"
                >
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {n.title}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    {n.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ProjectFormModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
      />
      <TaskFormModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
      />
    </div>
  );
};