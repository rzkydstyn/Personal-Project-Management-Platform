import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Project, Task } from '@/types/database.types';
import type { ProjectFormValues } from './schemas';

export interface ProjectWithStats extends Project {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  progress: number;
}

export const computeProjectStats = (
  project: Project,
  tasks: Task[]
): ProjectWithStats => {
  const projectTasks = tasks.filter((t) => t.project_id === project.id);
  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter((t) => t.status === 'done').length;
  const pendingTasks = totalTasks - completedTasks;
  const now = new Date();
  const overdueTasks = projectTasks.filter(
    (t) =>
      t.status !== 'done' &&
      t.due_date !== null &&
      new Date(t.due_date) < now
  ).length;
  const progress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    ...project,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    progress,
  };
};

export function useProjects() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['projects', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<ProjectWithStats[]> => {
      const [projectsRes, tasksRes] = await Promise.all([
        supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase.from('tasks').select('*'),
      ]);

      if (projectsRes.error) throw projectsRes.error;
      if (tasksRes.error) throw tasksRes.error;

      const projects = projectsRes.data ?? [];
      const tasks = tasksRes.data ?? [];

      return projects.map((p) => computeProjectStats(p, tasks));
    },
  });
}

export function useProjectDetail(projectId: string | undefined) {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['projects', projectId],
    enabled: !!user && !!projectId,
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');

      const [projectRes, tasksRes] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase
          .from('tasks')
          .select('*')
          .eq('project_id', projectId)
          .order('position', { ascending: true })
          .order('created_at', { ascending: false }),
      ]);

      if (projectRes.error) throw projectRes.error;
      if (tasksRes.error) throw tasksRes.error;

      const tasks = tasksRes.data ?? [];
      return {
        project: computeProjectStats(projectRes.data, tasks),
        tasks,
      };
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (values: ProjectFormValues) => {
      if (!user) throw new Error('Unauthenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: values.name.trim(),
          description: values.description?.trim() || null,
          status: values.status,
          start_date: values.startDate || null,
          due_date: values.dueDate || null,
          color: values.color,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: user.id,
        project_id: data.id,
        type: 'project_updated',
        title: 'Project Created',
        message: `Project "${data.name}" has been created.`,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: ProjectFormValues;
    }) => {
      if (!user) throw new Error('Unauthenticated');

      const { data, error } = await supabase
        .from('projects')
        .update({
          name: values.name.trim(),
          description: values.description?.trim() || null,
          status: values.status,
          start_date: values.startDate || null,
          due_date: values.dueDate || null,
          color: values.color,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: user.id,
        project_id: data.id,
        type: 'project_updated',
        title: 'Project Updated',
        message: `Project "${data.name}" was updated (${data.status}).`,
      });

      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['time_entries'] });
    },
  });
}