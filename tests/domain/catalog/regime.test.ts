import { describe, it, expect } from 'vitest';
import { RepRangeSchema, RegimeEntrySchema, RegimeSchema } from '@/domain/catalog/regime';

describe('RepRangeSchema', () => {
  it('parses a range', () => {
    expect(RepRangeSchema.parse({ min: 8, max: 12 })).toEqual({ min: 8, max: 12 });
  });

  it('parses a fixed count as min===max', () => {
    expect(RepRangeSchema.parse({ min: 5, max: 5 })).toEqual({ min: 5, max: 5 });
  });

  it('rejects max < min', () => {
    expect(() => RepRangeSchema.parse({ min: 12, max: 8 })).toThrow();
  });

  it('rejects zero reps', () => {
    expect(() => RepRangeSchema.parse({ min: 0, max: 5 })).toThrow();
  });
});

describe('RegimeEntrySchema', () => {
  it('parses an entry with optional rest omitted', () => {
    const parsed = RegimeEntrySchema.parse({
      exerciseId: 'bench-press',
      sets: 3,
      reps: { min: 8, max: 12 },
    });
    expect(parsed.restSeconds).toBeUndefined();
  });

  it('parses an entry with rest', () => {
    expect(
      RegimeEntrySchema.parse({
        exerciseId: 'bench-press',
        sets: 3,
        reps: { min: 8, max: 12 },
        restSeconds: 90,
      }).restSeconds,
    ).toBe(90);
  });
});

describe('RegimeSchema', () => {
  it('rejects a regime with no entries', () => {
    expect(() => RegimeSchema.parse({ id: 'r1', name: 'Empty', entries: [] })).toThrow();
  });
});
