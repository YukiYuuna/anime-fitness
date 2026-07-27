import { z } from 'zod';
import { MuscleGroupSchema, type MuscleGroup } from './muscle-group';
import { EquipmentSchema, type Equipment } from './equipment';
import { ExerciseSchema, type Exercise } from './exercise';
import { RegimeSchema, type Regime } from './regime';

export interface Catalog {
  muscleGroups: MuscleGroup[];
  equipment: Equipment[];
  exercises: Exercise[];
  regimes: Regime[];
}

export interface RawCatalogSources {
  muscleGroups: unknown;
  equipment: unknown;
  exercises: unknown;
  regimes: unknown;
}

export function loadCatalog(sources: RawCatalogSources): Catalog {
  return {
    muscleGroups: z.array(MuscleGroupSchema).parse(sources.muscleGroups),
    equipment: z.array(EquipmentSchema).parse(sources.equipment),
    exercises: z.array(ExerciseSchema).parse(sources.exercises),
    regimes: z.array(RegimeSchema).parse(sources.regimes),
  };
}
