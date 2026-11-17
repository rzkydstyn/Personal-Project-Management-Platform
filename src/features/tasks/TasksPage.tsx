import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  Plus,
  Search,
  CheckSquare,
  Calendar,
  Edit3,
  Trash2,
  Loader2,
} from 'lucide-react';
import {
  useTasks,
  useQuickUpdateTask,
  useDeleteTask,
  type TaskWithRelations,
} from './useTasks';
import { useProjects } from '@/features/projects/useProjects';
import { TaskFormModal, TaskDetailModal } from './TaskModals';
import { ConfirmDialog } from '@/components/ui/Modal';
import type { TaskPriority, TaskStatus } from '@/types/database.types';

export const TasksPage: React.FC = () => {
  const { data: tasks = [], isLoading } = useTasks();
  const { data: projects = [] } = useProjects();
  const quickUpdate = useQuickUpdateTask();
  const deleteTask = useDeleteTask();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'due_date'>('due_date');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(null);
  const [inspectingTask, setInspectingTask] = useState<TaskWithRelations | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaskWithRelations | null>(null);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        const matchesSearch =
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          (t.description || '').toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
          statusFilter === 'all' || t.status === statusFilter;
        const matchesPriority =
          priorityFilter === 'all' || t.priority === priorityFilter;
        const matchesProject =
          projectFilter === 'all' || t.project_id === projectFilter;
        return (
          matchesSearch && matchesStatus && matchesPriority && matchesProject
        );
      })
      .sort((a, b) => {
        if (sortBy === 'due_date') {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        }
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
  }, [tasks, search, statusFilter, priorityFilter, projectFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-[#6366F1]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-[20px] font-semibold text-slate-900 dark:text-white">
            My Tasks
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            View, filter, prioritize, and track all tasks across your projects.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingTask(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-[13px] font-medium text-white shadow-xs hover:bg-[#4F46E5]"
        >
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-[13px] text-slate-900 focus:border-[#6366F1] focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="all">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="all">All Statuses</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as 'created_at' | 'due_date')
          }
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="due_date">Sort: Due Date</option>
          <option value="created_at">Sort: Creation Date</option>
        </select>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <CheckSquare className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-3 text-[15px] font-semibold text-slate-900 dark:text-white">
            No tasks found
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-[13px] text-slate-500 dark:text-slate-400">
            {projects.length === 0
              ? 'Create a project first, then start adding tasks to your workspace.'
              : 'Create a new task or adjust your active filters.'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-2xs dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {filteredTasks.map((task) => {
            const isOverdue =
              task.status !== 'done' &&
              task.due_date &&
              new Date(task.due_date) < new Date();

            return (
              <div
                key={task.id}
                className="flex flex-col justify-between gap-4 p-4 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 lg:flex-row lg:items-center"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {task.project && (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: task.project.color }}
                        />
                        {task.project.name}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setInspectingTask(task)}
                      className={`text-left text-[14px] font-semibold hover:text-[#6366F1] ${
                        task.status === 'done'
                          ? 'line-through text-slate-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {task.title}
                    </button>
                  </div>

                  {task.description && (
                    <p className="line-clamp-1 text-[12px] text-slate-500 dark:text-slate-400">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {task.due_date && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium ${
                        isOverdue
                          ? 'bg-red-50 text-[#EF4444] dark:bg-red-950/50'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(task.due_date), 'dd MMM yyyy')}
                    </span>
                  )}

                  {/* Quick Priority Selector */}
                  <select
                    value={task.priority}
                    onChange={(e) =>
                      quickUpdate.mutate({
                        id: task.id,
                        priority: e.target.value as TaskPriority,
                      })
                    }
                    className={`rounded-lg border px-2.5 py-1 text-[12px] font-semibold capitalize ${
                      task.priority === 'high'
                        ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300'
                        : task.priority === 'medium'
                        ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-300'
                        : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>

                  {/* Quick Status Selector */}
                  <select
                    value={task.status}
                    onChange={(e) =>
                      quickUpdate.mutate({
                        id: task.id,
                        status: e.target.value as TaskStatus,
                        title: task.title,
                        projectId: task.project_id,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[12px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingTask(task);
                      setIsFormOpen(true);
                    }}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                    title="Edit task"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingTask(task)}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-[#EF4444]"
                    title="Delete task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingTask}
      />

      <TaskDetailModal
        task={inspectingTask}
        onClose={() => setInspectingTask(null)}
        onEdit={(t) => {
          setEditingTask(t);
          setIsFormOpen(true);
        }}
        onDelete={(t) => setDeletingTask(t)}
      />

      <ConfirmDialog
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={async () => {
          if (!deletingTask) return;
          await deleteTask.mutateAsync(deletingTask.id);
          setDeletingTask(null);
        }}
        title="Delete Task"
        message={`Are you sure you want to delete "${deletingTask?.title}"?`}
        isLoading={deleteTask.isPending}
      />
    </div>
  );
};