import { describe, it, expect } from 'vitest';
import { loadCatalog } from '@/domain/catalog/catalog';
import { validateCatalog } from '@/domain/catalog/validate';

function base() {
  return {
    muscleGroups: [{ id: 'chest', name: 'Chest' }],
    equipment: [{ id: 'barbell', name: 'Barbell' }],
    exercises: [
      {
        id: 'bench-press',
        name: 'Bench Press',
        primaryMuscleIds: ['chest'],
        equipmentIds: ['barbell'],
        movementCategory: 'push',
        difficulty: 'intermediate',
        trainedAttributes: ['strength'],
      },
    ],
    regimes: [
      {
        id: 'r1',
        name: 'Push',
        entries: [{ exerciseId: 'bench-press', sets: 3, reps: { min: 8, max: 12 } }],
      },
    ],
  };
}

describe('validateCatalog', () => {
  it('returns no errors for a consistent catalog', () => {
    expect(validateCatalog(loadCatalog(base()))).toEqual([]);
  });

  it('flags a dangling primary muscle reference', () => {
    const c = base();
    c.exercises[0].primaryMuscleIds = ['nonexistent'];
    expect(validateCatalog(loadCatalog(c)).length).toBeGreaterThan(0);
  });

  it('flags a dangling equipment reference', () => {
    const c = base();
    c.exercises[0].equipmentIds = ['nonexistent'];
    expect(validateCatalog(loadCatalog(c)).length).toBeGreaterThan(0);
  });

  it('flags a regime entry pointing at a missing exercise', () => {
    const c = base();
    c.regimes[0].entries[0].exerciseId = 'nonexistent';
    expect(validateCatalog(loadCatalog(c)).length).toBeGreaterThan(0);
  });

  it('flags an exercise with no primary muscle', () => {
    const catalog = loadCatalog(base());
    catalog.exercises[0].primaryMuscleIds =
      [] as unknown as (typeof catalog.exercises)[0]['primaryMuscleIds'];
    expect(validateCatalog(catalog).length).toBeGreaterThan(0);
  });

  it('flags an exercise with no trained attribute', () => {
    const catalog = loadCatalog(base());
    catalog.exercises[0].trainedAttributes =
      [] as unknown as (typeof catalog.exercises)[0]['trainedAttributes'];
    expect(validateCatalog(catalog).length).toBeGreaterThan(0);
  });

  it('flags duplicate ids', () => {
    const c = base();
    c.muscleGroups.push({ id: 'chest', name: 'Chest again' });
    expect(validateCatalog(loadCatalog(c)).length).toBeGreaterThan(0);
  });
});
