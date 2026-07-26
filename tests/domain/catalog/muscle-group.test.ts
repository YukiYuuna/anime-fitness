import { describe, it, expect } from 'vitest';
import { MuscleGroupSchema } from '@/domain/catalog/muscle-group';

describe('MuscleGroupSchema', () => {
  it('parses a valid muscle group', () => {
    expect(MuscleGroupSchema.parse({ id: 'chest', name: 'Chest' })).toEqual({
      id: 'chest',
      name: 'Chest',
    });
  });

  it('rejects a missing name', () => {
    expect(() => MuscleGroupSchema.parse({ id: 'chest' })).toThrow();
  });

  it('rejects an empty id', () => {
    expect(() => MuscleGroupSchema.parse({ id: '', name: 'Chest' })).toThrow();
  });
});
