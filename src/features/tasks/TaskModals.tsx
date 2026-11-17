import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  FolderKanban,
  Edit3,
  Trash2,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { taskSchema, type TaskFormValues } from './schemas';
import {
  useCreateTask,
  useUpdateTask,
  type TaskWithRelations,
} from './useTasks';
import { useProjects } from '@/features/projects/useProjects';
import type { TaskStatus } from '@/types/database.types';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: TaskWithRelations | null;
  defaultProjectId?: string;
  defaultStatus?: TaskStatus;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  defaultProjectId,
  defaultStatus = 'todo',
}) => {
  const isEditing = !!initialData;
  const { data: projects = [] } = useProjects();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      projectId: defaultProjectId || '',
      status: defaultStatus,
      priority: 'medium',
      dueDate: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        description: initialData.description || '',
        projectId: initialData.project_id,
        status: initialData.status,
        priority: initialData.priority,
        dueDate: initialData.due_date
          ? initialData.due_date.slice(0, 10)
          : '',
      });
    } else {
      reset({
        title: '',
        description: '',
        projectId: defaultProjectId || projects[0]?.id || '',
        status: defaultStatus,
        priority: 'medium',
        dueDate: '',
      });
    }
    setServerError(null);
  }, [initialData, defaultProjectId, defaultStatus, projects, isOpen, reset]);

  const onSubmit = async (values: TaskFormValues) => {
    setServerError(null);
    try {
      if (isEditing && initialData) {
        await updateTask.mutateAsync({ id: initialData.id, values });
      } else {
        await createTask.mutateAsync(values);
      }
      onClose();
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'Failed to save task'
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'Create New Task'}
      description={
        isEditing
          ? 'Update task details, status, priority, or deadline.'
          : 'Add a new actionable task to your project.'
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <div>
          <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">
            Task Title *
          </label>
          <input
            type="text"
            placeholder="e.g. Implement Supabase RLS policies"
            {...register('title')}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-[14px] text-slate-900 focus:border-[#6366F1] focus:outline-hidden focus:ring-2 focus:ring-[#6366F1]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          {errors.title && (
            <p className="mt-1 text-[12px] text-[#EF4444]">
              {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">
            Project *
          </label>
          <select
            {...register('projectId')}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[14px] text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="">Select a project...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {errors.projectId && (
            <p className="mt-1 text-[12px] text-[#EF4444]">
              {errors.projectId.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Add acceptance criteria, links, or notes..."
            {...register('description')}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-[14px] text-slate-900 focus:border-[#6366F1] focus:outline-hidden focus:ring-2 focus:ring-[#6366F1]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">
              Status
            </label>
            <select
              {...register('status')}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[14px] text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">
              Priority
            </label>
            <select
              {...register('priority')}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[14px] text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">
              Due Date
            </label>
            <input
              type="date"
              {...register('dueDate')}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[14px] text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || projects.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#4F46E5] disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{isEditing ? 'Save Changes' : 'Create Task'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

interface TaskDetailModalProps {
  task: TaskWithRelations | null;
  onClose: () => void;
  onEdit: (task: TaskWithRelations) => void;
  onDelete: (task: TaskWithRelations) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!task) return null;

  const formatDuration = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <Modal
      isOpen={!!task}
      onClose={onClose}
      title={task.title}
      description={`Created on ${format(new Date(task.created_at), 'dd MMM yyyy, HH:mm')}`}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          {task.project && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[12px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: task.project.color }}
              />
              <FolderKanban className="h-3.5 w-3.5" />
              {task.project.name}
            </span>
          )}

          <span
            className={`rounded-full px-3 py-1 text-[12px] font-semibold uppercase ${
              task.priority === 'high'
                ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                : task.priority === 'medium'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {task.priority} Priority
          </span>

          <span className="rounded-full bg-indigo-50 px-3 py-1 text-[12px] font-semibold capitalize text-[#6366F1] dark:bg-indigo-950/60 dark:text-indigo-300">
            {task.status.replace('_', ' ')}
          </span>
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <h4 className="text-[12px] font-semibold uppercase tracking-wider text-slate-400">
            Description
          </h4>
          <p className="mt-1.5 whitespace-pre-wrap text-[14px] text-slate-700 dark:text-slate-200">
            {task.description || 'No description provided for this task.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <Calendar className="h-5 w-5 text-[#6366F1]" />
            <div>
              <p className="text-[11px] text-slate-500">Due Date</p>
              <p className="text-[13px] font-medium text-slate-900 dark:text-white">
                {task.due_date
                  ? format(new Date(task.due_date), 'dd MMM yyyy')
                  : 'No deadline'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <Clock className="h-5 w-5 text-[#16A34A]" />
            <div>
              <p className="text-[11px] text-slate-500">Tracked Time</p>
              <p className="text-[13px] font-medium text-slate-900 dark:text-white">
                {formatDuration(task.trackedSeconds)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete(task);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-950/40"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Task</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(task);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#6366F1] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#4F46E5]"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Task</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};