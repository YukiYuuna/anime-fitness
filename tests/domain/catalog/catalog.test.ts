import { describe, it, expect } from 'vitest';
import { loadCatalog } from '@/domain/catalog/catalog';

const sources = {
  muscleGroups: [{ id: 'chest', name: 'Chest' }],
  equipment: [{ id: 'barbell', name: 'Barbell' }],
  exercises: [
    {
      id: 'bench-press',
      name: 'Barbell Bench Press',
      primaryMuscleIds: ['chest'],
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

describe('loadCatalog', () => {
  it('parses valid sources into a typed Catalog', () => {
    const catalog = loadCatalog(sources);
    expect(catalog.exercises).toHaveLength(1);
    expect(catalog.exercises[0].secondaryMuscleIds).toEqual([]);
  });

  it('throws on an invalid record', () => {
    const bad = { ...sources, muscleGroups: [{ id: 'chest' }] };
    expect(() => loadCatalog(bad)).toThrow();
  });
});
