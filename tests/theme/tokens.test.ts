import { describe, it, expect } from 'vitest';
import { tokens } from '@/theme/tokens';

describe('theme tokens', () => {
  it('exposes dark-palette colors as hex strings', () => {
    expect(tokens.colors.background).toMatch(/^#[0-9a-fA-F]{3,8}$/);
    expect(tokens.colors.text).toMatch(/^#[0-9a-fA-F]{3,8}$/);
    expect(tokens.colors.primary).toMatch(/^#[0-9a-fA-F]{3,8}$/);
  });

  it('has an ascending spacing scale', () => {
    expect(tokens.spacing.xs).toBeLessThan(tokens.spacing.md);
    expect(tokens.spacing.md).toBeLessThan(tokens.spacing.xl);
  });

  it('has typography roles with a title larger than body', () => {
    expect(tokens.typography.title.fontSize).toBeGreaterThan(tokens.typography.body.fontSize);
  });
});
