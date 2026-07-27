import { describe, it, expect } from 'vitest';
import { validateCatalog } from '@/domain/catalog/validate';
import { seedCatalog } from '@/domain/catalog/seed/index';

describe('seed catalog', () => {
  it('loads without throwing and has content', () => {
    expect(seedCatalog.exercises.length).toBeGreaterThan(0);
    expect(seedCatalog.regimes.length).toBeGreaterThan(0);
  });

  it('passes referential-integrity validation with zero errors', () => {
    expect(validateCatalog(seedCatalog)).toEqual([]);
  });
});
