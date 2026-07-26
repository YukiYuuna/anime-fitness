import { z } from 'zod';
import { ExerciseIdSchema, MuscleGroupIdSchema, EquipmentIdSchema } from './ids';
import { MovementCategorySchema, DifficultySchema, TrainedAttributeSchema } from './enums';

export const ExerciseSchema = z.object({
  id: ExerciseIdSchema,
  name: z.string().min(1),
  primaryMuscleIds: z.array(MuscleGroupIdSchema).min(1),
  secondaryMuscleIds: z.array(MuscleGroupIdSchema).default([]),
  equipmentIds: z.array(EquipmentIdSchema).default([]),
  movementCategory: MovementCategorySchema,
  difficulty: DifficultySchema,
  trainedAttributes: z.array(TrainedAttributeSchema).min(1),
  instructions: z.array(z.string()).default([]),
});
export type Exercise = z.infer<typeof ExerciseSchema>;
