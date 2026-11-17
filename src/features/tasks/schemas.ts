import { z } from 'zod';

export const taskSchema = z.object({
  title: z
    .string()
    .min(2, 'Task title must be at least 2 characters')
    .max(200, 'Task title must not exceed 200 characters'),
  description: z
    .string()
    .max(2000, 'Description is too long')
    .optional()
    .or(z.literal('')),
  projectId: z.string().min(1, 'Please select a project'),
  status: z.enum(['todo', 'in_progress', 'review', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().optional().or(z.literal('')),
});

export type TaskFormValues = z.infer<typeof taskSchema>;