import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Plus,
  Search,
  FolderKanban,
  Calendar,
  Edit3,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  useProjects,
  useProjectDetail,
  useDeleteProject,
  type ProjectWithStats,
} from './useProjects';
import { ProjectFormModal } from './ProjectFormModal';
import {
  useQuickUpdateTask,
  useDeleteTask,
  type TaskWithRelations,
} from '@/features/tasks/useTasks';
import { TaskFormModal, TaskDetailModal } from '@/features/tasks/TaskModals';
import { ConfirmDialog } from '@/components/ui/Modal';
import type { ProjectStatus, TaskStatus } from '@/types/database.types';

const STATUS_BADGE: Record<ProjectStatus, string> = {
  planning: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  active: 'bg-indigo-50 text-[#6366F1] dark:bg-indigo-950/60 dark:text-indigo-300',
  completed: 'bg-emerald-50 text-[#16A34A] dark:bg-emerald-950/60 dark:text-emerald-300',
  archived: 'bg-amber-50 text-[#F59E0B] dark:bg-amber-950/60 dark:text-amber-300',
};

export const ProjectsPage: React.FC = () => {
  const { data: projects = [], isLoading } = useProjects();
  const deleteProject = useDeleteProject();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'due_date' | 'progress'>('newest');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithStats | null>(null);
  const [deletingProject, setDeletingProject] = useState<ProjectWithStats | null>(null);

  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.description || '').toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
          statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'progress') return b.progress - a.progress;
        if (sortBy === 'due_date') {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        }
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
  }, [projects, search, statusFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-[#6366F1]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-[20px] font-semibold text-slate-900 dark:text-white">
            Projects Directory
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            Manage your personal projects, timelines, and overall completion progress.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingProject(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-[13px] font-medium text-white shadow-xs hover:bg-[#4F46E5]"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name or description..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3.5 py-2 text-[13px] text-slate-900 focus:border-[#6366F1] focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as 'newest' | 'due_date' | 'progress')
            }
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="newest">Sort: Newest</option>
            <option value="due_date">Sort: Due Date</option>
            <option value="progress">Sort: Progress</option>
          </select>
        </div>
      </div>

      {/* Project Cards Grid */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <FolderKanban className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-3 text-[15px] font-semibold text-slate-900 dark:text-white">
            No projects found
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-[13px] text-slate-500 dark:text-slate-400">
            {projects.length === 0
              ? 'Get started by creating your first project to organize tasks and deadlines.'
              : 'No projects match your current search or filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-3.5 w-3.5 shrink-0 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-[16px] font-semibold text-slate-900 hover:text-[#6366F1] dark:text-white dark:hover:text-indigo-400 line-clamp-1"
                    >
                      {project.name}
                    </Link>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                      STATUS_BADGE[project.status]
                    }`}
                  >
                    {project.status}
                  </span>
                </div>

                <p className="mt-2 line-clamp-2 text-[13px] text-slate-500 dark:text-slate-400 min-h-[38px]">
                  {project.description || 'No description provided.'}
                </p>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-medium text-slate-600 dark:text-slate-400">
                      Progress ({project.completedTasks}/{project.totalTasks} tasks)
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${project.progress}%`,
                        backgroundColor: project.color,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5 text-[12px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {project.due_date
                      ? `Due ${format(new Date(project.due_date), 'dd MMM yyyy')}`
                      : 'No deadline'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProject(project);
                      setIsModalOpen(true);
                    }}
                    className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    title="Edit project"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingProject(project)}
                    className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-[#EF4444] dark:hover:bg-red-950/40"
                    title="Delete project"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingProject}
      />

      <ConfirmDialog
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={async () => {
          if (!deletingProject) return;
          await deleteProject.mutateAsync(deletingProject.id);
          setDeletingProject(null);
        }}
        title="Delete Project"
        message={`Are you sure you want to delete "${deletingProject?.name}"? All associated tasks and time entries in this project will be permanently removed.`}
        isLoading={deleteProject.isPending}
      />
    </div>
  );
};

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useProjectDetail(id);
  const deleteProject = useDeleteProject();
  const quickUpdateTask = useQuickUpdateTask();
  const deleteTask = useDeleteTask();

  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(null);
  const [inspectingTask, setInspectingTask] = useState<TaskWithRelations | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaskWithRelations | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-[#6366F1]" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-[15px] font-medium text-slate-700 dark:text-slate-300">
          Project not found or you do not have access.
        </p>
        <Link
          to="/projects"
          className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#6366F1]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </Link>
      </div>
    );
  }

  const { project, tasks } = data;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Projects</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditProjectOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Project</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteProjectOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-[13px] font-medium text-[#EF4444] hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/40"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Project Overview Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <h2 className="text-[22px] font-bold text-slate-900 dark:text-white">
                {project.name}
              </h2>
              <span
                className={`rounded-full px-3 py-0.5 text-[12px] font-semibold capitalize ${
                  STATUS_BADGE[project.status]
                }`}
              >
                {project.status}
              </span>
            </div>
            <p className="max-w-3xl text-[14px] text-slate-600 dark:text-slate-300">
              {project.description || 'No project description provided.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-[13px] text-slate-500 dark:text-slate-400">
            <div>
              <span className="block text-[11px] uppercase">Start Date</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {project.start_date
                  ? format(new Date(project.start_date), 'dd MMM yyyy')
                  : 'Not set'}
              </span>
            </div>
            <div>
              <span className="block text-[11px] uppercase">Due Date</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {project.due_date
                  ? format(new Date(project.due_date), 'dd MMM yyyy')
                  : 'Not set'}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Metric Pills */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 dark:border-slate-800 sm:grid-cols-4">
          <div className="flex items-center gap-3">
            <FolderKanban className="h-5 w-5 text-[#6366F1]" />
            <div>
              <p className="text-[12px] text-slate-500">Total Tasks</p>
              <p className="text-[18px] font-bold text-slate-900 dark:text-white">
                {project.totalTasks}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-[#16A34A]" />
            <div>
              <p className="text-[12px] text-slate-500">Completed</p>
              <p className="text-[18px] font-bold text-slate-900 dark:text-white">
                {project.completedTasks} ({project.progress}%)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-[#3B82F6]" />
            <div>
              <p className="text-[12px] text-slate-500">Pending</p>
              <p className="text-[18px] font-bold text-slate-900 dark:text-white">
                {project.pendingTasks}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-[#EF4444]" />
            <div>
              <p className="text-[12px] text-slate-500">Overdue</p>
              <p className="text-[18px] font-bold text-slate-900 dark:text-white">
                {project.overdueTasks}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Task List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[17px] font-semibold text-slate-900 dark:text-white">
            Project Tasks ({tasks.length})
          </h3>
          <button
            type="button"
            onClick={() => {
              setEditingTask(null);
              setIsTaskFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#6366F1] px-3.5 py-2 text-[13px] font-medium text-white hover:bg-[#4F46E5]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[14px] text-slate-500">
              No tasks in this project yet. Click &ldquo;Add Task&rdquo; to create one.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
            {tasks.map((task) => {
              const richTask: TaskWithRelations = {
                ...task,
                project: {
                  id: project.id,
                  name: project.name,
                  color: project.color,
                  status: project.status,
                },
                trackedSeconds: 0,
              };
              return (
                <div
                  key={task.id}
                  className="flex flex-col justify-between gap-3 p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 sm:flex-row sm:items-center"
                >
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setInspectingTask(richTask)}
                      className={`text-left text-[14px] font-semibold hover:text-[#6366F1] ${
                        task.status === 'done'
                          ? 'line-through text-slate-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {task.title}
                    </button>
                    {task.description && (
                      <p className="line-clamp-1 text-[12px] text-slate-500">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {task.due_date && (
                      <span className="text-[12px] text-slate-500">
                        Due {format(new Date(task.due_date), 'dd MMM')}
                      </span>
                    )}

                    <select
                      value={task.status}
                      onChange={(e) =>
                        quickUpdateTask.mutate({
                          id: task.id,
                          status: e.target.value as TaskStatus,
                          title: task.title,
                          projectId: project.id,
                        })
                      }
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[12px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <option value="todo">Todo</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingTask(richTask);
                        setIsTaskFormOpen(true);
                      }}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingTask(richTask)}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-[#EF4444]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <ProjectFormModal
        isOpen={isEditProjectOpen}
        onClose={() => setIsEditProjectOpen(false)}
        initialData={project}
      />

      <ConfirmDialog
        isOpen={isDeleteProjectOpen}
        onClose={() => setIsDeleteProjectOpen(false)}
        onConfirm={async () => {
          await deleteProject.mutateAsync(project.id);
          navigate('/projects', { replace: true });
        }}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
        isLoading={deleteProject.isPending}
      />

      <TaskFormModal
        isOpen={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
        initialData={editingTask}
        defaultProjectId={project.id}
      />

      <TaskDetailModal
        task={inspectingTask}
        onClose={() => setInspectingTask(null)}
        onEdit={(t) => {
          setEditingTask(t);
          setIsTaskFormOpen(true);
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
        message={`Delete task "${deletingTask?.title}" permanently?`}
        isLoading={deleteTask.isPending}
      />
    </div>
  );
};