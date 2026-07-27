import { z } from 'zod';
import { ExerciseIdSchema, RegimeIdSchema } from './ids';

export const RepRangeSchema = z
  .object({
    min: z.number().int().min(1),
    max: z.number().int().min(1),
  })
  .refine((r) => r.max >= r.min, { message: 'reps.max must be >= reps.min' });
export type RepRange = z.infer<typeof RepRangeSchema>;

export const RegimeEntrySchema = z.object({
  exerciseId: ExerciseIdSchema,
  sets: z.number().int().min(1),
  reps: RepRangeSchema,
  restSeconds: z.number().int().min(0).optional(),
});
export type RegimeEntry = z.infer<typeof RegimeEntrySchema>;

export const RegimeSchema = z.object({
  id: RegimeIdSchema,
  name: z.string().min(1),
  description: z.string().optional(),
  entries: z.array(RegimeEntrySchema).min(1),
});
export type Regime = z.infer<typeof RegimeSchema>;
