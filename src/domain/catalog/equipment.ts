import { z } from 'zod';
import { EquipmentIdSchema } from './ids';

export const EquipmentSchema = z.object({
  id: EquipmentIdSchema,
  name: z.string().min(1),
});
export type Equipment = z.infer<typeof EquipmentSchema>;
