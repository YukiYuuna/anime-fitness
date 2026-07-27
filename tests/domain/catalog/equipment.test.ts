import { describe, it, expect } from 'vitest';
import { EquipmentSchema } from '@/domain/catalog/equipment';

describe('EquipmentSchema', () => {
  it('parses valid equipment', () => {
    expect(EquipmentSchema.parse({ id: 'barbell', name: 'Barbell' })).toEqual({
      id: 'barbell',
      name: 'Barbell',
    });
  });

  it('rejects a missing name', () => {
    expect(() => EquipmentSchema.parse({ id: 'barbell' })).toThrow();
  });
});
