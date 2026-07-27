import type { Catalog } from './catalog';

function findDuplicates(ids: string[]): string[] {
  const seen = new Set<string>();
  const dups = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) dups.add(id);
    seen.add(id);
  }
  return [...dups];
}

export function validateCatalog(catalog: Catalog): string[] {
  const errors: string[] = [];

  const muscleIds = new Set(catalog.muscleGroups.map((m) => m.id));
  const equipmentIds = new Set(catalog.equipment.map((e) => e.id));
  const exerciseIds = new Set(catalog.exercises.map((e) => e.id));

  for (const [label, ids] of [
    ['muscleGroups', catalog.muscleGroups.map((m) => m.id)],
    ['equipment', catalog.equipment.map((e) => e.id)],
    ['exercises', catalog.exercises.map((e) => e.id)],
    ['regimes', catalog.regimes.map((r) => r.id)],
  ] as const) {
    for (const dup of findDuplicates(ids)) {
      errors.push(`duplicate id "${dup}" in ${label}`);
    }
  }

  for (const ex of catalog.exercises) {
    for (const id of [...ex.primaryMuscleIds, ...ex.secondaryMuscleIds]) {
      if (!muscleIds.has(id)) errors.push(`exercise "${ex.id}" references unknown muscle "${id}"`);
    }
    for (const id of ex.equipmentIds) {
      if (!equipmentIds.has(id))
        errors.push(`exercise "${ex.id}" references unknown equipment "${id}"`);
    }
    if (ex.primaryMuscleIds.length < 1) errors.push(`exercise "${ex.id}" has no primary muscle`);
    if (ex.trainedAttributes.length < 1)
      errors.push(`exercise "${ex.id}" has no trained attribute`);
  }

  for (const regime of catalog.regimes) {
    for (const entry of regime.entries) {
      if (!exerciseIds.has(entry.exerciseId)) {
        errors.push(`regime "${regime.id}" references unknown exercise "${entry.exerciseId}"`);
      }
    }
  }

  return errors;
}
