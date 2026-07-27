import { z } from 'zod';

export const MovementCategorySchema = z.enum(['push', 'pull', 'legs', 'core', 'full_body']);
export type MovementCategory = z.infer<typeof MovementCategorySchema>;

export const DifficultySchema = z.enum(['beginner', 'intermediate', 'advanced']);
export type Difficulty = z.infer<typeof DifficultySchema>;

export const TrainedAttributeSchema = z.enum([
  'strength',
  'endurance',
  'speed',
  'power',
  'mobility',
]);
export type TrainedAttribute = z.infer<typeof TrainedAttributeSchema>;
