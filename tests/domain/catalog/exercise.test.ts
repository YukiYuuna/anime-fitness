import { describe, it, expect } from 'vitest';
import { ExerciseSchema } from '@/domain/catalog/exercise';

const valid = {
  id: 'bench-press',
  name: 'Barbell Bench Press',
  primaryMuscleIds: ['chest'],
  secondaryMuscleIds: ['triceps', 'shoulders'],
  equipmentIds: ['barbell'],
  movementCategory: 'push',
  difficulty: 'intermediate',
  trainedAttributes: ['strength', 'power'],
  instructions: ['Lie on the bench.', 'Press the bar up.'],
};

describe('ExerciseSchema', () => {
  it('parses a valid exercise', () => {
    expect(ExerciseSchema.parse(valid)).toMatchObject({
      id: 'bench-press',
      name: 'Barbell Bench Press',
    });
  });

  it('defaults optional array fields', () => {
    const parsed = ExerciseSchema.parse({
      id: 'plank',
      name: 'Plank',
      primaryMuscleIds: ['abdominals'],
      movementCategory: 'core',
      difficulty: 'beginner',
      trainedAttributes: ['endurance'],
    });
    expect(parsed.secondaryMuscleIds).toEqual([]);
    expect(parsed.equipmentIds).toEqual([]);
    expect(parsed.instructions).toEqual([]);
  });

  it('rejects an exercise with no primary muscle', () => {
    expect(() => ExerciseSchema.parse({ ...valid, primaryMuscleIds: [] })).toThrow();
  });

  it('rejects an exercise with no trained attribute', () => {
    expect(() => ExerciseSchema.parse({ ...valid, trainedAttributes: [] })).toThrow();
  });

  it('rejects an invalid movement category', () => {
    expect(() => ExerciseSchema.parse({ ...valid, movementCategory: 'cardio' })).toThrow();
  });
});
