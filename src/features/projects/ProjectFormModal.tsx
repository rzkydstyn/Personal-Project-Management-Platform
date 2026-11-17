import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import {
  projectSchema,
  PROJECT_COLORS,
  type ProjectFormValues,
} from './schemas';
import { useCreateProject, useUpdateProject } from './useProjects';
import type { Project } from '@/types/database.types';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Project | null;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const isEditing = !!initialData;
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'active',
      startDate: '',
      dueDate: '',
      color: '#6366F1',
    },
  });

  const selectedColor = watch('color');

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description || '',
        status: initialData.status,
        startDate: initialData.start_date || '',
        dueDate: initialData.due_date || '',
        color: initialData.color || '#6366F1',
      });
    } else {
      reset({
        name: '',
        description: '',
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        color: '#6366F1',
      });
    }
    setServerError(null);
  }, [initialData, isOpen, reset]);

  const onSubmit = async (values: ProjectFormValues) => {
    setServerError(null);
    try {
      if (isEditing && initialData) {
        await updateProject.mutateAsync({ id: initialData.id, values });
      } else {
        await createProject.mutateAsync(values);
      }
      onClose();
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'Failed to save project'
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Project' : 'Create New Project'}
      description={
        isEditing
          ? 'Update your project details, timeline, and status.'
          : 'Organize your tasks under a dedicated project workspace.'
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
            Project Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Personal Portfolio Redesign"
            {...register('name')}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-[14px] text-slate-900 focus:border-[#6366F1] focus:outline-hidden focus:ring-2 focus:ring-[#6366F1]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          {errors.name && (
            <p className="mt-1 text-[12px] text-[#EF4444]">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Describe project objectives, deliverables, or notes..."
            {...register('description')}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-[14px] text-slate-900 focus:border-[#6366F1] focus:outline-hidden focus:ring-2 focus:ring-[#6366F1]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          {errors.description && (
            <p className="mt-1 text-[12px] text-[#EF4444]">
              {errors.description.message}
            </p>
          )}
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
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">
              Start Date
            </label>
            <input
              type="date"
              {...register('startDate')}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[14px] text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
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
            {errors.dueDate && (
              <p className="mt-1 text-[12px] text-[#EF4444]">
                {errors.dueDate.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-2">
            Color Identifier
          </label>
          <div className="flex flex-wrap gap-2.5">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setValue('color', c.value)}
                className={`h-8 w-8 rounded-full transition-transform ${
                  selectedColor === c.value
                    ? 'scale-110 ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-slate-900'
                    : 'opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.value }}
                title={c.label}
              />
            ))}
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
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#4F46E5] disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{isEditing ? 'Save Changes' : 'Create Project'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};