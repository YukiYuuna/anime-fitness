import { describe, it, expect } from 'vitest';
import {
  slugify,
  toExercise,
  type FreeExerciseDbRecord,
} from '@/domain/catalog/import/from-free-exercise-db';

const bench: FreeExerciseDbRecord = {
  name: 'Barbell Bench Press',
  force: 'push',
  level: 'intermediate',
  mechanic: 'compound',
  equipment: 'barbell',
  primaryMuscles: ['chest'],
  secondaryMuscles: ['triceps', 'shoulders'],
  category: 'strength',
  instructions: ['Lie down.', 'Press up.'],
};

describe('slugify', () => {
  it('kebab-cases a name', () => {
    expect(slugify('Barbell Bench Press')).toBe('barbell-bench-press');
  });
});

describe('toExercise', () => {
  it('maps a record to a valid Exercise', () => {
    const ex = toExercise(bench);
    expect(ex.id).toBe('barbell-bench-press');
    expect(ex.difficulty).toBe('intermediate');
    expect(ex.movementCategory).toBe('push');
    expect(ex.primaryMuscleIds).toEqual(['chest']);
    expect(ex.equipmentIds).toEqual(['barbell']);
    expect(ex.trainedAttributes).toContain('strength');
  });

  it('maps free-exercise-db "expert" level to "advanced"', () => {
    expect(toExercise({ ...bench, level: 'expert' }).difficulty).toBe('advanced');
  });

  it('classifies a leg exercise by primary muscle', () => {
    const squat = {
      ...bench,
      name: 'Back Squat',
      primaryMuscles: ['quadriceps'],
      force: 'push' as const,
    };
    expect(toExercise(squat).movementCategory).toBe('legs');
  });
});
