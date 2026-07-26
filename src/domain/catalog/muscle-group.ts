import { z } from 'zod';
import { MuscleGroupIdSchema } from './ids';

export const MuscleGroupSchema = z.object({
  id: MuscleGroupIdSchema,
  name: z.string().min(1),
});
export type MuscleGroup = z.infer<typeof MuscleGroupSchema>;
