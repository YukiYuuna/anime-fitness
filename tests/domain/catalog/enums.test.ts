import { describe, it, expect } from 'vitest';
import {
  MovementCategorySchema,
  DifficultySchema,
  TrainedAttributeSchema,
} from '@/domain/catalog/enums';

describe('enums', () => {
  it('accepts valid members', () => {
    expect(MovementCategorySchema.parse('legs')).toBe('legs');
    expect(DifficultySchema.parse('advanced')).toBe('advanced');
    expect(TrainedAttributeSchema.parse('mobility')).toBe('mobility');
  });

  it('rejects invalid members', () => {
    expect(() => MovementCategorySchema.parse('cardio')).toThrow();
    expect(() => DifficultySchema.parse('expert')).toThrow();
  });
});
