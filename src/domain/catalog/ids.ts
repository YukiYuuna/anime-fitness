import { z } from 'zod';

export const ExerciseIdSchema = z.string().min(1).brand<'ExerciseId'>();
export type ExerciseId = z.infer<typeof ExerciseIdSchema>;

export const MuscleGroupIdSchema = z.string().min(1).brand<'MuscleGroupId'>();
export type MuscleGroupId = z.infer<typeof MuscleGroupIdSchema>;

export const EquipmentIdSchema = z.string().min(1).brand<'EquipmentId'>();
export type EquipmentId = z.infer<typeof EquipmentIdSchema>;

export const RegimeIdSchema = z.string().min(1).brand<'RegimeId'>();
export type RegimeId = z.infer<typeof RegimeIdSchema>;
