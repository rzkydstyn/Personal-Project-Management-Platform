import { z } from 'zod';

export const PROJECT_COLORS = [
  { label: 'Indigo', value: '#6366F1' },
  { label: 'Blue', value: '#3B82F6' },
  { label: 'Emerald', value: '#16A34A' },
  { label: 'Amber', value: '#F59E0B' },
  { label: 'Rose', value: '#EF4444' },
  { label: 'Purple', value: '#8B5CF6' },
  { label: 'Cyan', value: '#06B6D4' },
  { label: 'Slate', value: '#64748B' },
];

export const projectSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Project name must be at least 2 characters')
      .max(150, 'Project name must not exceed 150 characters'),
    description: z
      .string()
      .max(1000, 'Description is too long')
      .optional()
      .or(z.literal('')),
    status: z.enum(['planning', 'active', 'completed', 'archived']),
    startDate: z.string().optional().or(z.literal('')),
    dueDate: z.string().optional().or(z.literal('')),
    color: z.string().min(4, 'Please pick a project color'),
  })
  .refine(
    (data) => {
      if (data.startDate && data.dueDate) {
        return new Date(data.dueDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'Due date cannot be earlier than start date',
      path: ['dueDate'],
    }
  );

export type ProjectFormValues = z.infer<typeof projectSchema>;