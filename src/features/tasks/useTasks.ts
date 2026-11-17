import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import type {
  Task,
  Project,
  TaskStatus,
  TaskPriority,
  TimeEntry,
} from '@/types/database.types';
import type { TaskFormValues } from './schemas';

export interface TaskWithRelations extends Task {
  project?: Pick<Project, 'id' | 'name' | 'color' | 'status'>;
  trackedSeconds: number;
}

export function useTasks() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['tasks', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<TaskWithRelations[]> => {
      const [tasksRes, projectsRes, entriesRes] = await Promise.all([
        supabase
          .from('tasks')
          .select('*')
          .order('position', { ascending: true })
          .order('created_at', { ascending: false }),
        supabase.from('projects').select('id, name, color, status'),
        supabase.from('time_entries').select('*'),
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (projectsRes.error) throw projectsRes.error;
      if (entriesRes.error) throw entriesRes.error;

      const projectMap = new Map(
        (projectsRes.data ?? []).map((p) => [p.id, p])
      );

      const timeByTask = new Map<string, number>();
      (entriesRes.data ?? []).forEach((entry: TimeEntry) => {
        const start = new Date(entry.started_at).getTime();
        const end = entry.ended_at
          ? new Date(entry.ended_at).getTime()
          : Date.now();
        const seconds = Math.max(0, Math.floor((end - start) / 1000));
        timeByTask.set(
          entry.task_id,
          (timeByTask.get(entry.task_id) || 0) + seconds
        );
      });

      return (tasksRes.data ?? []).map((task) => ({
        ...task,
        project: projectMap.get(task.project_id),
        trackedSeconds: timeByTask.get(task.id) || 0,
      }));
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (values: TaskFormValues) => {
      if (!user) throw new Error('Unauthenticated');

      const { data: existingTasks } = await supabase
        .from('tasks')
        .select('position')
        .eq('status', values.status)
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition =
        existingTasks && existingTasks.length > 0
          ? existingTasks[0].position + 1
          : 0;

      const isoDueDate = values.dueDate
        ? new Date(`${values.dueDate}T23:59:59`).toISOString()
        : null;

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          project_id: values.projectId,
          title: values.title.trim(),
          description: values.description?.trim() || null,
          status: values.status,
          priority: values.priority,
          due_date: isoDueDate,
          position: nextPosition,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: user.id,
        task_id: data.id,
        project_id: data.project_id,
        type: 'task_created',
        title: 'New Task Created',
        message: `Task "${data.title}" was added.`,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: TaskFormValues;
    }) => {
      if (!user) throw new Error('Unauthenticated');

      const isoDueDate = values.dueDate
        ? new Date(`${values.dueDate}T23:59:59`).toISOString()
        : null;

      const { data, error } = await supabase
        .from('tasks')
        .update({
          project_id: values.projectId,
          title: values.title.trim(),
          description: values.description?.trim() || null,
          status: values.status,
          priority: values.priority,
          due_date: isoDueDate,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const notifType =
        data.status === 'done' ? 'task_completed' : 'task_updated';
      const notifTitle =
        data.status === 'done' ? 'Task Completed' : 'Task Updated';

      await supabase.from('notifications').insert({
        user_id: user.id,
        task_id: data.id,
        project_id: data.project_id,
        type: notifType,
        title: notifTitle,
        message: `Task "${data.title}" is now marked as ${data.status.replace('_', ' ')}.`,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useQuickUpdateTask() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async ({
      id,
      status,
      priority,
      title,
      projectId,
    }: {
      id: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      title?: string;
      projectId?: string;
    }) => {
      if (!user) throw new Error('Unauthenticated');

      // Ganti Record<string, unknown> menjadi tipe spesifik di bawah ini:
      const payload: {
        status?: TaskStatus;
        priority?: TaskPriority;
      } = {};

      if (status) payload.status = status;
      if (priority) payload.priority = priority;

      const { data, error } = await supabase
        .from('tasks')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (status === 'done') {
        await supabase.from('notifications').insert({
          user_id: user.id,
          task_id: id,
          project_id: projectId || data.project_id,
          type: 'task_completed',
          title: 'Task Completed',
          message: `You completed "${title || data.title}".`,
        });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}