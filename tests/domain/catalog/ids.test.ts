import { describe, it, expect } from 'vitest';
import { ExerciseIdSchema, MuscleGroupIdSchema } from '@/domain/catalog/ids';

describe('branded ids', () => {
  it('parses a non-empty string', () => {
    expect(ExerciseIdSchema.parse('bench-press')).toBe('bench-press');
  });

  it('rejects an empty string', () => {
    expect(() => MuscleGroupIdSchema.parse('')).toThrow();
  });
});
