# Fitness Domain Model (001) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the catalog-layer fitness domain model — Zod schemas + branded ids for Exercise/MuscleGroup/Equipment/Regime, a loader and referential-integrity validator, a real seed dataset, and a free-exercise-db import tool — as the repo's first `src/` code.

**Architecture:** Pure TypeScript, no UI/persistence. Zod schemas are the single source of truth; TS types are inferred via `z.infer`. Data is loaded in-memory from committed seed JSON, parsed loudly through the schemas, then checked for cross-entity referential integrity. Organized by feature under `src/domain/catalog/`, one responsibility per file.

**Tech Stack:** TypeScript (strict, ESM), Zod (schemas + validation), Vitest (tests). The repo is already `"type": "module"`, `moduleResolution: "Bundler"`, `resolveJsonModule: true`, `strict: true`, and globs `**/*.ts` for typecheck.

## Global Constraints

- **The user performs ALL git operations.** Do NOT run `git add`, `git commit`, `git mv`, `git rm`, `git push`, or any other git write command. Where a task would commit, present the file list + a suggested Conventional Commit message and hand off. Deleting a file is done with the filesystem (`rm`)/your editor, never `git rm`.
- **Dependencies:** `zod@^3.23.0` (runtime), `vitest@^2.1.0` (dev). Installed via `npm install` in Task 1. If the npm registry is unreachable in the sandbox, report BLOCKED — do not fabricate success.
- **TypeScript strict**, no `any` unless justified in a comment. `npm run typecheck` (`tsc --noEmit`) must pass.
- **Lint & format:** `npm run lint` (ESLint) and `npm run format:check` (Prettier) must pass. Tests import Vitest APIs explicitly (`import { describe, it, expect } from 'vitest'`) — do NOT rely on globals (keeps ESLint happy with no extra config).
- **Schema/type naming (canonical, used across all tasks):** the Zod schema is `<Name>Schema`; the inferred type is `<Name>`. Example: `ExerciseSchema` / `type Exercise`. Branded id schemas: `ExerciseIdSchema`, `MuscleGroupIdSchema`, `EquipmentIdSchema`, `RegimeIdSchema`; their types drop `Schema`.
- **Enum members (exact):** `MovementCategory` = `push | pull | legs | core | full_body`; `Difficulty` = `beginner | intermediate | advanced`; `TrainedAttribute` = `strength | endurance | speed | power | mobility`.
- **Imports are extensionless** (Bundler resolution), e.g. `export * from './ids';`.
- **Scope:** catalog only. No user-activity logging, no anime-character mapping, no UI/persistence.

---

### Task 1: Project setup — Zod, Vitest, first test

Adds the two dependencies, a minimal Vitest config, the `test` script, and a smoke test proving the toolchain runs. Everything after this depends on it.

**Files:**

- Modify: `package.json` (dependencies, devDependencies, scripts)
- Create: `vitest.config.ts`
- Create: `src/domain/catalog/smoke.test.ts` (temporary; deleted at end of task)

**Interfaces:**

- Consumes: nothing (first task).
- Produces: a working `npm run test` (Vitest) and `zod` available to import.

- [ ] **Step 1: Install dependencies**

Run: `npm install zod@^3.23.0 && npm install -D vitest@^2.1.0`
Expected: exits 0; `package.json` gains `zod` under `dependencies` and `vitest` under `devDependencies`. If the registry is unreachable, STOP and report BLOCKED.

- [ ] **Step 2: Add the `test` scripts to `package.json`**

In `package.json`, find the `"scripts"` block:

```json
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  },
```

Replace it with:

```json
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 4: Write a smoke test**

Create `src/domain/catalog/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('toolchain', () => {
  it('runs vitest', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run the smoke test**

Run: `npm run test`
Expected: Vitest reports 1 passed test.

- [ ] **Step 6: Verify lint/typecheck/format still pass**

Run: `npm run typecheck && npm run lint && npm run format`
Expected: all exit 0 (format may reformat `package.json`/config).

- [ ] **Step 7: Delete the smoke test**

Delete `src/domain/catalog/smoke.test.ts` (filesystem delete, not `git rm`). It was only to prove the toolchain.

- [ ] **Step 8: Hand off commit**

Do NOT run git. Tell the user to stage `package.json`, `package-lock.json`, `vitest.config.ts` and commit:
`chore(domain): add zod and vitest toolchain`

---

### Task 2: Branded ids and enums

The foundation types every schema builds on.

**Files:**

- Create: `src/domain/catalog/ids.ts`
- Create: `src/domain/catalog/enums.ts`
- Test: `src/domain/catalog/ids.test.ts`, `src/domain/catalog/enums.test.ts`

**Interfaces:**

- Consumes: `zod`.
- Produces:
  - `ExerciseIdSchema`, `MuscleGroupIdSchema`, `EquipmentIdSchema`, `RegimeIdSchema` (each `ZodBranded<ZodString, …>`); types `ExerciseId`, `MuscleGroupId`, `EquipmentId`, `RegimeId`.
  - `MovementCategorySchema`, `DifficultySchema`, `TrainedAttributeSchema` (Zod enums); types `MovementCategory`, `Difficulty`, `TrainedAttribute`.

- [ ] **Step 1: Write failing tests**

Create `src/domain/catalog/ids.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { ExerciseIdSchema, MuscleGroupIdSchema } from './ids';

describe('branded ids', () => {
  it('parses a non-empty string', () => {
    expect(ExerciseIdSchema.parse('bench-press')).toBe('bench-press');
  });

  it('rejects an empty string', () => {
    expect(() => MuscleGroupIdSchema.parse('')).toThrow();
  });
});
```

Create `src/domain/catalog/enums.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { MovementCategorySchema, DifficultySchema, TrainedAttributeSchema } from './enums';

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test`
Expected: FAIL — cannot resolve `./ids` / `./enums`.

- [ ] **Step 3: Implement `ids.ts`**

```ts
import { z } from 'zod';

export const ExerciseIdSchema = z.string().min(1).brand<'ExerciseId'>();
export type ExerciseId = z.infer<typeof ExerciseIdSchema>;

export const MuscleGroupIdSchema = z.string().min(1).brand<'MuscleGroupId'>();
export type MuscleGroupId = z.infer<typeof MuscleGroupIdSchema>;

export const EquipmentIdSchema = z.string().min(1).brand<'EquipmentId'>();
export type EquipmentId = z.infer<typeof EquipmentIdSchema>;

export const RegimeIdSchema = z.string().min(1).brand<'RegimeId'>();
export type RegimeId = z.infer<typeof RegimeIdSchema>;
```

- [ ] **Step 4: Implement `enums.ts`**

```ts
import { z } from 'zod';

export const MovementCategorySchema = z.enum(['push', 'pull', 'legs', 'core', 'full_body']);
export type MovementCategory = z.infer<typeof MovementCategorySchema>;

export const DifficultySchema = z.enum(['beginner', 'intermediate', 'advanced']);
export type Difficulty = z.infer<typeof DifficultySchema>;

export const TrainedAttributeSchema = z.enum([
  'strength',
  'endurance',
  'speed',
  'power',
  'mobility',
]);
export type TrainedAttribute = z.infer<typeof TrainedAttributeSchema>;
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS (ids + enums).

- [ ] **Step 6: Typecheck/lint/format**

Run: `npm run typecheck && npm run lint && npm run format:check`
Expected: all exit 0.

- [ ] **Step 7: Hand off commit**

Files: `src/domain/catalog/ids.ts`, `enums.ts`, `ids.test.ts`, `enums.test.ts`.
Message: `feat(domain): add branded ids and enums`

---

### Task 3: Leaf entity schemas — MuscleGroup and Equipment

Two trivial reference entities, together (identical shape).

**Files:**

- Create: `src/domain/catalog/muscle-group.ts`, `src/domain/catalog/equipment.ts`
- Test: `src/domain/catalog/muscle-group.test.ts`, `src/domain/catalog/equipment.test.ts`

**Interfaces:**

- Consumes: `MuscleGroupIdSchema`, `EquipmentIdSchema` from `./ids`.
- Produces: `MuscleGroupSchema`/`type MuscleGroup` (`{ id: MuscleGroupId; name: string }`); `EquipmentSchema`/`type Equipment` (`{ id: EquipmentId; name: string }`).

- [ ] **Step 1: Write failing tests**

Create `src/domain/catalog/muscle-group.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { MuscleGroupSchema } from './muscle-group';

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
```

Create `src/domain/catalog/equipment.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { EquipmentSchema } from './equipment';

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test`
Expected: FAIL — cannot resolve `./muscle-group` / `./equipment`.

- [ ] **Step 3: Implement `muscle-group.ts`**

```ts
import { z } from 'zod';
import { MuscleGroupIdSchema } from './ids';

export const MuscleGroupSchema = z.object({
  id: MuscleGroupIdSchema,
  name: z.string().min(1),
});
export type MuscleGroup = z.infer<typeof MuscleGroupSchema>;
```

- [ ] **Step 4: Implement `equipment.ts`**

```ts
import { z } from 'zod';
import { EquipmentIdSchema } from './ids';

export const EquipmentSchema = z.object({
  id: EquipmentIdSchema,
  name: z.string().min(1),
});
export type Equipment = z.infer<typeof EquipmentSchema>;
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 6: Typecheck/lint/format**

Run: `npm run typecheck && npm run lint && npm run format:check`
Expected: all exit 0.

- [ ] **Step 7: Hand off commit**

Files: the four files above.
Message: `feat(domain): add MuscleGroup and Equipment schemas`

---

### Task 4: Exercise schema

The central catalog entity.

**Files:**

- Create: `src/domain/catalog/exercise.ts`
- Test: `src/domain/catalog/exercise.test.ts`

**Interfaces:**

- Consumes: `MuscleGroupIdSchema`, `EquipmentIdSchema` from `./ids`; `MovementCategorySchema`, `DifficultySchema`, `TrainedAttributeSchema` from `./enums`.
- Produces: `ExerciseSchema`/`type Exercise` with fields `id: ExerciseId`, `name: string`, `primaryMuscleIds: MuscleGroupId[]` (≥1), `secondaryMuscleIds: MuscleGroupId[]` (default `[]`), `equipmentIds: EquipmentId[]` (default `[]`), `movementCategory: MovementCategory`, `difficulty: Difficulty`, `trainedAttributes: TrainedAttribute[]` (≥1), `instructions: string[]` (default `[]`).

- [ ] **Step 1: Write failing tests**

Create `src/domain/catalog/exercise.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { ExerciseSchema } from './exercise';

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test`
Expected: FAIL — cannot resolve `./exercise`.

- [ ] **Step 3: Implement `exercise.ts`**

```ts
import { z } from 'zod';
import { ExerciseIdSchema, MuscleGroupIdSchema, EquipmentIdSchema } from './ids';
import { MovementCategorySchema, DifficultySchema, TrainedAttributeSchema } from './enums';

export const ExerciseSchema = z.object({
  id: ExerciseIdSchema,
  name: z.string().min(1),
  primaryMuscleIds: z.array(MuscleGroupIdSchema).min(1),
  secondaryMuscleIds: z.array(MuscleGroupIdSchema).default([]),
  equipmentIds: z.array(EquipmentIdSchema).default([]),
  movementCategory: MovementCategorySchema,
  difficulty: DifficultySchema,
  trainedAttributes: z.array(TrainedAttributeSchema).min(1),
  instructions: z.array(z.string()).default([]),
});
export type Exercise = z.infer<typeof ExerciseSchema>;
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Typecheck/lint/format**

Run: `npm run typecheck && npm run lint && npm run format:check`
Expected: all exit 0.

- [ ] **Step 6: Hand off commit**

Files: `src/domain/catalog/exercise.ts`, `exercise.test.ts`.
Message: `feat(domain): add Exercise schema`

---

### Task 5: Regime schemas — RepRange, RegimeEntry, Regime

The workout-template entity, with rep ranges and optional rest.

**Files:**

- Create: `src/domain/catalog/regime.ts`
- Test: `src/domain/catalog/regime.test.ts`

**Interfaces:**

- Consumes: `ExerciseIdSchema`, `RegimeIdSchema` from `./ids`.
- Produces:
  - `RepRangeSchema`/`type RepRange` = `{ min: number; max: number }` (ints ≥1, refined `max >= min`).
  - `RegimeEntrySchema`/`type RegimeEntry` = `{ exerciseId: ExerciseId; sets: number; reps: RepRange; restSeconds?: number }`.
  - `RegimeSchema`/`type Regime` = `{ id: RegimeId; name: string; description?: string; entries: RegimeEntry[] }` (entries ≥1, ordered).

- [ ] **Step 1: Write failing tests**

Create `src/domain/catalog/regime.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { RepRangeSchema, RegimeEntrySchema, RegimeSchema } from './regime';

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test`
Expected: FAIL — cannot resolve `./regime`.

- [ ] **Step 3: Implement `regime.ts`**

```ts
import { z } from 'zod';
import { ExerciseIdSchema, RegimeIdSchema } from './ids';

export const RepRangeSchema = z
  .object({
    min: z.number().int().min(1),
    max: z.number().int().min(1),
  })
  .refine((r) => r.max >= r.min, { message: 'reps.max must be >= reps.min' });
export type RepRange = z.infer<typeof RepRangeSchema>;

export const RegimeEntrySchema = z.object({
  exerciseId: ExerciseIdSchema,
  sets: z.number().int().min(1),
  reps: RepRangeSchema,
  restSeconds: z.number().int().min(0).optional(),
});
export type RegimeEntry = z.infer<typeof RegimeEntrySchema>;

export const RegimeSchema = z.object({
  id: RegimeIdSchema,
  name: z.string().min(1),
  description: z.string().optional(),
  entries: z.array(RegimeEntrySchema).min(1),
});
export type Regime = z.infer<typeof RegimeSchema>;
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Typecheck/lint/format**

Run: `npm run typecheck && npm run lint && npm run format:check`
Expected: all exit 0.

- [ ] **Step 6: Hand off commit**

Files: `src/domain/catalog/regime.ts`, `regime.test.ts`.
Message: `feat(domain): add Regime schemas with rep ranges`

---

### Task 6: Catalog aggregate + loadCatalog + public API

Bundles the collections and parses raw sources loudly.

**Files:**

- Create: `src/domain/catalog/catalog.ts`
- Create: `src/domain/catalog/index.ts`
- Test: `src/domain/catalog/catalog.test.ts`

**Interfaces:**

- Consumes: all four entity schemas + their types.
- Produces:
  - `interface Catalog { muscleGroups: MuscleGroup[]; equipment: Equipment[]; exercises: Exercise[]; regimes: Regime[] }`
  - `interface RawCatalogSources { muscleGroups: unknown; equipment: unknown; exercises: unknown; regimes: unknown }`
  - `function loadCatalog(sources: RawCatalogSources): Catalog` — parses each collection with `z.array(<Schema>).parse(...)`, throwing `ZodError` on any invalid record.
  - `index.ts` re-exports the public API.

- [ ] **Step 1: Write failing test**

Create `src/domain/catalog/catalog.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { loadCatalog } from './catalog';

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL — cannot resolve `./catalog`.

- [ ] **Step 3: Implement `catalog.ts`**

```ts
import { z } from 'zod';
import { MuscleGroupSchema, type MuscleGroup } from './muscle-group';
import { EquipmentSchema, type Equipment } from './equipment';
import { ExerciseSchema, type Exercise } from './exercise';
import { RegimeSchema, type Regime } from './regime';

export interface Catalog {
  muscleGroups: MuscleGroup[];
  equipment: Equipment[];
  exercises: Exercise[];
  regimes: Regime[];
}

export interface RawCatalogSources {
  muscleGroups: unknown;
  equipment: unknown;
  exercises: unknown;
  regimes: unknown;
}

export function loadCatalog(sources: RawCatalogSources): Catalog {
  return {
    muscleGroups: z.array(MuscleGroupSchema).parse(sources.muscleGroups),
    equipment: z.array(EquipmentSchema).parse(sources.equipment),
    exercises: z.array(ExerciseSchema).parse(sources.exercises),
    regimes: z.array(RegimeSchema).parse(sources.regimes),
  };
}
```

- [ ] **Step 4: Implement `index.ts`**

```ts
export * from './ids';
export * from './enums';
export * from './muscle-group';
export * from './equipment';
export * from './exercise';
export * from './regime';
export * from './catalog';
export * from './validate';
```

Note: `./validate` is created in Task 7. If executing tasks strictly in order, add the `export * from './validate';` line at the end of Task 7 instead, so `index.ts` never references a missing module. (Either way, the final `index.ts` must export all eight modules.)

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 6: Typecheck/lint/format**

Run: `npm run typecheck && npm run lint && npm run format:check`
Expected: all exit 0. (If `index.ts` already references `./validate` before Task 7, typecheck will fail — defer that one export line to Task 7 per the note above.)

- [ ] **Step 7: Hand off commit**

Files: `src/domain/catalog/catalog.ts`, `index.ts`, `catalog.test.ts`.
Message: `feat(domain): add Catalog aggregate and loadCatalog`

---

### Task 7: validateCatalog — referential integrity

Cross-entity checks Zod can't express per-record.

**Files:**

- Create: `src/domain/catalog/validate.ts`
- Modify: `src/domain/catalog/index.ts` (add `export * from './validate';` if not already present)
- Test: `src/domain/catalog/validate.test.ts`

**Interfaces:**

- Consumes: `Catalog` from `./catalog`.
- Produces: `function validateCatalog(catalog: Catalog): string[]` — returns a list of human-readable error messages; empty array means valid. Checks: duplicate ids within each of the four collections; every `primaryMuscleIds`/`secondaryMuscleIds` resolves to a `MuscleGroup`; every `equipmentIds` resolves to an `Equipment`; every `RegimeEntry.exerciseId` resolves to an `Exercise`.

- [ ] **Step 1: Write failing tests**

Create `src/domain/catalog/validate.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { loadCatalog } from './catalog';
import { validateCatalog } from './validate';

function base() {
  return {
    muscleGroups: [{ id: 'chest', name: 'Chest' }],
    equipment: [{ id: 'barbell', name: 'Barbell' }],
    exercises: [
      {
        id: 'bench-press',
        name: 'Bench Press',
        primaryMuscleIds: ['chest'],
        equipmentIds: ['barbell'],
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
}

describe('validateCatalog', () => {
  it('returns no errors for a consistent catalog', () => {
    expect(validateCatalog(loadCatalog(base()))).toEqual([]);
  });

  it('flags a dangling primary muscle reference', () => {
    const c = base();
    c.exercises[0].primaryMuscleIds = ['nonexistent'];
    expect(validateCatalog(loadCatalog(c)).length).toBeGreaterThan(0);
  });

  it('flags a dangling equipment reference', () => {
    const c = base();
    c.exercises[0].equipmentIds = ['nonexistent'];
    expect(validateCatalog(loadCatalog(c)).length).toBeGreaterThan(0);
  });

  it('flags a regime entry pointing at a missing exercise', () => {
    const c = base();
    c.regimes[0].entries[0].exerciseId = 'nonexistent';
    expect(validateCatalog(loadCatalog(c)).length).toBeGreaterThan(0);
  });

  it('flags duplicate ids', () => {
    const c = base();
    c.muscleGroups.push({ id: 'chest', name: 'Chest again' });
    expect(validateCatalog(loadCatalog(c)).length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test`
Expected: FAIL — cannot resolve `./validate`.

- [ ] **Step 3: Implement `validate.ts`**

```ts
import type { Catalog } from './catalog';

function findDuplicates(ids: string[]): string[] {
  const seen = new Set<string>();
  const dups = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) dups.add(id);
    seen.add(id);
  }
  return [...dups];
}

export function validateCatalog(catalog: Catalog): string[] {
  const errors: string[] = [];

  const muscleIds = new Set(catalog.muscleGroups.map((m) => m.id));
  const equipmentIds = new Set(catalog.equipment.map((e) => e.id));
  const exerciseIds = new Set(catalog.exercises.map((e) => e.id));

  for (const [label, ids] of [
    ['muscleGroups', catalog.muscleGroups.map((m) => m.id)],
    ['equipment', catalog.equipment.map((e) => e.id)],
    ['exercises', catalog.exercises.map((e) => e.id)],
    ['regimes', catalog.regimes.map((r) => r.id)],
  ] as const) {
    for (const dup of findDuplicates(ids)) {
      errors.push(`duplicate id "${dup}" in ${label}`);
    }
  }

  for (const ex of catalog.exercises) {
    for (const id of [...ex.primaryMuscleIds, ...ex.secondaryMuscleIds]) {
      if (!muscleIds.has(id)) errors.push(`exercise "${ex.id}" references unknown muscle "${id}"`);
    }
    for (const id of ex.equipmentIds) {
      if (!equipmentIds.has(id))
        errors.push(`exercise "${ex.id}" references unknown equipment "${id}"`);
    }
  }

  for (const regime of catalog.regimes) {
    for (const entry of regime.entries) {
      if (!exerciseIds.has(entry.exerciseId)) {
        errors.push(`regime "${regime.id}" references unknown exercise "${entry.exerciseId}"`);
      }
    }
  }

  return errors;
}
```

- [ ] **Step 4: Ensure `index.ts` exports validate**

Confirm `src/domain/catalog/index.ts` contains `export * from './validate';` (add it if Task 6 deferred it).

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS (all validate tests).

- [ ] **Step 6: Typecheck/lint/format**

Run: `npm run typecheck && npm run lint && npm run format:check`
Expected: all exit 0.

- [ ] **Step 7: Hand off commit**

Files: `src/domain/catalog/validate.ts`, `validate.test.ts`, `index.ts`.
Message: `feat(domain): add validateCatalog referential-integrity checks`

---

### Task 8: Seed dataset + integrity guard

The real curated seed, wired through `loadCatalog`, guarded by a test that it passes `validateCatalog` with zero errors.

**Files:**

- Create: `src/domain/catalog/seed/muscle-groups.json`, `equipment.json`, `exercises.json`, `regimes.json`
- Create: `src/domain/catalog/seed/index.ts`
- Test: `src/domain/catalog/seed/seed.test.ts`

**Interfaces:**

- Consumes: `loadCatalog`, `validateCatalog`, `Catalog`.
- Produces: `seedCatalog: Catalog` exported from `seed/index.ts`.

- [ ] **Step 1: Create `seed/muscle-groups.json`**

```json
[
  { "id": "chest", "name": "Chest" },
  { "id": "triceps", "name": "Triceps" },
  { "id": "shoulders", "name": "Shoulders" },
  { "id": "lats", "name": "Lats" },
  { "id": "middle_back", "name": "Middle Back" },
  { "id": "lower_back", "name": "Lower Back" },
  { "id": "biceps", "name": "Biceps" },
  { "id": "forearms", "name": "Forearms" },
  { "id": "traps", "name": "Traps" },
  { "id": "abdominals", "name": "Abdominals" },
  { "id": "quadriceps", "name": "Quadriceps" },
  { "id": "hamstrings", "name": "Hamstrings" },
  { "id": "glutes", "name": "Glutes" },
  { "id": "calves", "name": "Calves" }
]
```

- [ ] **Step 2: Create `seed/equipment.json`**

```json
[
  { "id": "barbell", "name": "Barbell" },
  { "id": "dumbbell", "name": "Dumbbell" },
  { "id": "body_only", "name": "Body Only" }
]
```

- [ ] **Step 3: Create `seed/exercises.json`**

```json
[
  {
    "id": "barbell-bench-press",
    "name": "Barbell Bench Press",
    "primaryMuscleIds": ["chest"],
    "secondaryMuscleIds": ["triceps", "shoulders"],
    "equipmentIds": ["barbell"],
    "movementCategory": "push",
    "difficulty": "intermediate",
    "trainedAttributes": ["strength", "power"],
    "instructions": [
      "Lie flat on the bench and grip the bar slightly wider than shoulder width.",
      "Lower the bar to mid-chest, then press it back up to full extension."
    ]
  },
  {
    "id": "barbell-back-squat",
    "name": "Barbell Back Squat",
    "primaryMuscleIds": ["quadriceps"],
    "secondaryMuscleIds": ["glutes", "hamstrings", "lower_back"],
    "equipmentIds": ["barbell"],
    "movementCategory": "legs",
    "difficulty": "intermediate",
    "trainedAttributes": ["strength", "power"],
    "instructions": [
      "Rest the bar across your upper back and stand with feet shoulder-width apart.",
      "Descend until thighs are at least parallel, then drive up through your heels."
    ]
  },
  {
    "id": "conventional-deadlift",
    "name": "Conventional Deadlift",
    "primaryMuscleIds": ["lower_back", "hamstrings", "glutes"],
    "secondaryMuscleIds": ["quadriceps", "traps", "forearms"],
    "equipmentIds": ["barbell"],
    "movementCategory": "full_body",
    "difficulty": "intermediate",
    "trainedAttributes": ["strength", "power"],
    "instructions": [
      "Stand with mid-foot under the bar and grip just outside your knees.",
      "Drive through the floor and stand tall, keeping the bar close to your body."
    ]
  },
  {
    "id": "pull-up",
    "name": "Pull-Up",
    "primaryMuscleIds": ["lats"],
    "secondaryMuscleIds": ["biceps", "middle_back"],
    "equipmentIds": ["body_only"],
    "movementCategory": "pull",
    "difficulty": "intermediate",
    "trainedAttributes": ["strength"],
    "instructions": [
      "Hang from the bar with an overhand grip.",
      "Pull your chin over the bar, then lower under control."
    ]
  },
  {
    "id": "push-up",
    "name": "Push-Up",
    "primaryMuscleIds": ["chest"],
    "secondaryMuscleIds": ["triceps", "shoulders"],
    "equipmentIds": ["body_only"],
    "movementCategory": "push",
    "difficulty": "beginner",
    "trainedAttributes": ["strength", "endurance"],
    "instructions": [
      "Start in a plank with hands under your shoulders.",
      "Lower your chest to the floor, then press back up."
    ]
  },
  {
    "id": "overhead-press",
    "name": "Standing Overhead Press",
    "primaryMuscleIds": ["shoulders"],
    "secondaryMuscleIds": ["triceps"],
    "equipmentIds": ["barbell"],
    "movementCategory": "push",
    "difficulty": "intermediate",
    "trainedAttributes": ["strength"],
    "instructions": [
      "Hold the bar at shoulder height with a shoulder-width grip.",
      "Press overhead to full lockout, then lower to the shoulders."
    ]
  },
  {
    "id": "barbell-row",
    "name": "Bent-Over Barbell Row",
    "primaryMuscleIds": ["middle_back"],
    "secondaryMuscleIds": ["lats", "biceps"],
    "equipmentIds": ["barbell"],
    "movementCategory": "pull",
    "difficulty": "intermediate",
    "trainedAttributes": ["strength"],
    "instructions": [
      "Hinge at the hips with a flat back, holding the bar at arm's length.",
      "Row the bar to your lower ribs, then lower under control."
    ]
  },
  {
    "id": "plank",
    "name": "Plank",
    "primaryMuscleIds": ["abdominals"],
    "secondaryMuscleIds": ["lower_back"],
    "equipmentIds": ["body_only"],
    "movementCategory": "core",
    "difficulty": "beginner",
    "trainedAttributes": ["endurance"],
    "instructions": [
      "Rest on your forearms and toes with a straight body line.",
      "Brace your core and hold."
    ]
  },
  {
    "id": "dumbbell-biceps-curl",
    "name": "Dumbbell Biceps Curl",
    "primaryMuscleIds": ["biceps"],
    "secondaryMuscleIds": ["forearms"],
    "equipmentIds": ["dumbbell"],
    "movementCategory": "pull",
    "difficulty": "beginner",
    "trainedAttributes": ["strength"],
    "instructions": [
      "Hold a dumbbell in each hand with palms forward.",
      "Curl to the shoulders, then lower slowly."
    ]
  },
  {
    "id": "walking-lunge",
    "name": "Walking Lunge",
    "primaryMuscleIds": ["quadriceps", "glutes"],
    "secondaryMuscleIds": ["hamstrings"],
    "equipmentIds": ["body_only"],
    "movementCategory": "legs",
    "difficulty": "beginner",
    "trainedAttributes": ["strength", "endurance"],
    "instructions": [
      "Step forward into a lunge until both knees are ~90 degrees.",
      "Push off the front foot and step through into the next lunge."
    ]
  },
  {
    "id": "standing-calf-raise",
    "name": "Standing Calf Raise",
    "primaryMuscleIds": ["calves"],
    "secondaryMuscleIds": [],
    "equipmentIds": ["body_only"],
    "movementCategory": "legs",
    "difficulty": "beginner",
    "trainedAttributes": ["strength"],
    "instructions": [
      "Stand tall on the balls of your feet.",
      "Raise your heels as high as possible, then lower slowly."
    ]
  },
  {
    "id": "jumping-jacks",
    "name": "Jumping Jacks",
    "primaryMuscleIds": ["calves"],
    "secondaryMuscleIds": ["shoulders"],
    "equipmentIds": ["body_only"],
    "movementCategory": "full_body",
    "difficulty": "beginner",
    "trainedAttributes": ["endurance", "speed"],
    "instructions": [
      "Jump while spreading your legs and raising your arms overhead.",
      "Return to standing and repeat rhythmically."
    ]
  },
  {
    "id": "standing-hamstring-stretch",
    "name": "Standing Hamstring Stretch",
    "primaryMuscleIds": ["hamstrings"],
    "secondaryMuscleIds": ["lower_back"],
    "equipmentIds": ["body_only"],
    "movementCategory": "legs",
    "difficulty": "beginner",
    "trainedAttributes": ["mobility"],
    "instructions": [
      "Hinge forward at the hips, reaching toward your toes.",
      "Hold at a gentle stretch without bouncing."
    ]
  }
]
```

- [ ] **Step 4: Create `seed/regimes.json`**

```json
[
  {
    "id": "beginner-full-body",
    "name": "Beginner Full Body",
    "description": "A simple full-body session for newcomers.",
    "entries": [
      { "exerciseId": "push-up", "sets": 3, "reps": { "min": 8, "max": 12 }, "restSeconds": 60 },
      {
        "exerciseId": "walking-lunge",
        "sets": 3,
        "reps": { "min": 10, "max": 12 },
        "restSeconds": 60
      },
      {
        "exerciseId": "barbell-row",
        "sets": 3,
        "reps": { "min": 8, "max": 12 },
        "restSeconds": 90
      },
      { "exerciseId": "plank", "sets": 3, "reps": { "min": 1, "max": 1 }, "restSeconds": 45 }
    ]
  },
  {
    "id": "upper-push",
    "name": "Upper Body Push",
    "entries": [
      {
        "exerciseId": "barbell-bench-press",
        "sets": 4,
        "reps": { "min": 6, "max": 8 },
        "restSeconds": 120
      },
      {
        "exerciseId": "overhead-press",
        "sets": 3,
        "reps": { "min": 8, "max": 10 },
        "restSeconds": 90
      },
      { "exerciseId": "dumbbell-biceps-curl", "sets": 3, "reps": { "min": 10, "max": 12 } }
    ]
  }
]
```

- [ ] **Step 5: Create `seed/index.ts`**

```ts
import { loadCatalog, type Catalog } from '../catalog';
import muscleGroups from './muscle-groups.json';
import equipment from './equipment.json';
import exercises from './exercises.json';
import regimes from './regimes.json';

export const seedCatalog: Catalog = loadCatalog({ muscleGroups, equipment, exercises, regimes });
```

- [ ] **Step 6: Write the integrity test**

Create `src/domain/catalog/seed/seed.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { validateCatalog } from '../validate';
import { seedCatalog } from './index';

describe('seed catalog', () => {
  it('loads without throwing and has content', () => {
    expect(seedCatalog.exercises.length).toBeGreaterThan(0);
    expect(seedCatalog.regimes.length).toBeGreaterThan(0);
  });

  it('passes referential-integrity validation with zero errors', () => {
    expect(validateCatalog(seedCatalog)).toEqual([]);
  });
});
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS. If `validateCatalog` reports errors, fix the seed JSON (a reference typo), not the validator.

- [ ] **Step 8: Typecheck/lint/format**

Run: `npm run typecheck && npm run lint && npm run format`
Expected: all exit 0. (`loadCatalog` at import time also means a malformed seed fails `npm run test` loudly.)

- [ ] **Step 9: Hand off commit**

Files: the four seed JSON files, `seed/index.ts`, `seed/seed.test.ts`.
Message: `feat(domain): add curated seed catalog and integrity guard`

---

### Task 9: free-exercise-db import transform

The documented dev tool that maps free-exercise-db records into our shape, with the authored-field heuristics. Tested against an inline sample record (no network).

**Files:**

- Create: `src/domain/catalog/import/from-free-exercise-db.ts`
- Create: `src/domain/catalog/import/README.md`
- Test: `src/domain/catalog/import/from-free-exercise-db.test.ts`

**Interfaces:**

- Consumes: `Exercise`, `ExerciseSchema`, enum types.
- Produces:
  - `interface FreeExerciseDbRecord` — the source shape (subset of fields we use).
  - `function slugify(name: string): string`.
  - `function toExercise(record: FreeExerciseDbRecord): Exercise` — maps a source record, applying the movement-category and trained-attribute heuristics, and returns a schema-validated `Exercise` (parsed through `ExerciseSchema`).

- [ ] **Step 1: Write failing test**

Create `src/domain/catalog/import/from-free-exercise-db.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { slugify, toExercise, type FreeExerciseDbRecord } from './from-free-exercise-db';

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL — cannot resolve `./from-free-exercise-db`.

- [ ] **Step 3: Implement `from-free-exercise-db.ts`**

```ts
import { ExerciseSchema, type Exercise } from '../exercise';
import type { Difficulty, MovementCategory, TrainedAttribute } from '../enums';

export interface FreeExerciseDbRecord {
  name: string;
  force: 'push' | 'pull' | 'static' | null;
  level: 'beginner' | 'intermediate' | 'expert';
  mechanic: 'compound' | 'isolation' | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  category: string;
  instructions: string[];
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const LEG_MUSCLES = new Set([
  'quadriceps',
  'hamstrings',
  'glutes',
  'calves',
  'adductors',
  'abductors',
]);
const CORE_MUSCLES = new Set(['abdominals', 'lower back']);

function toDifficulty(level: FreeExerciseDbRecord['level']): Difficulty {
  return level === 'expert' ? 'advanced' : level;
}

function toMovementCategory(record: FreeExerciseDbRecord): MovementCategory {
  const primary = record.primaryMuscles[0]?.toLowerCase() ?? '';
  if (LEG_MUSCLES.has(primary)) return 'legs';
  if (CORE_MUSCLES.has(primary)) return 'core';
  if (record.force === 'push') return 'push';
  if (record.force === 'pull') return 'pull';
  return 'full_body';
}

function toTrainedAttributes(record: FreeExerciseDbRecord): TrainedAttribute[] {
  const attrs = new Set<TrainedAttribute>();
  const category = record.category.toLowerCase();
  if (category === 'cardio') attrs.add('endurance');
  if (category === 'stretching') attrs.add('mobility');
  if (category === 'plyometrics') {
    attrs.add('speed');
    attrs.add('power');
  }
  if (['strength', 'powerlifting', 'strongman'].includes(category)) attrs.add('strength');
  if (category === 'olympic weightlifting') {
    attrs.add('strength');
    attrs.add('power');
  }
  if (attrs.size === 0) attrs.add('strength'); // heuristic fallback; hand-curate afterward
  return [...attrs];
}

export function toExercise(record: FreeExerciseDbRecord): Exercise {
  const draft = {
    id: slugify(record.name),
    name: record.name,
    primaryMuscleIds: record.primaryMuscles.map((m) => slugify(m)),
    secondaryMuscleIds: record.secondaryMuscles.map((m) => slugify(m)),
    equipmentIds: record.equipment ? [slugify(record.equipment)] : [],
    movementCategory: toMovementCategory(record),
    difficulty: toDifficulty(record.level),
    trainedAttributes: toTrainedAttributes(record),
    instructions: record.instructions,
  };
  return ExerciseSchema.parse(draft);
}
```

- [ ] **Step 4: Create `import/README.md`**

```markdown
# Seed regeneration — free-exercise-db

The committed seed under `../seed/` was produced with `from-free-exercise-db.ts`.
This tool is **not imported by app code**; it exists to regenerate/expand the seed.

## How to regenerate

1. Download the free-exercise-db dataset (public domain):
   https://github.com/yuhonas/free-exercise-db — `dist/exercises.json`.
2. Write a small local script that reads that JSON, picks the subset you want,
   maps each record with `toExercise(record)`, and writes the result to
   `../seed/exercises.json`. Derive `muscle-groups.json` and `equipment.json`
   from the distinct `slugify`'d muscle/equipment values used.
3. `movementCategory` and `trainedAttributes` are filled by heuristics in
   `toExercise` (free-exercise-db has no equivalent) — **review and hand-curate
   them afterward**, then run `npm run test` so the seed integrity test confirms
   referential integrity.

Keeping the transform pure (record in → `Exercise` out) is deliberate: the file
system / dataset download stays in your throwaway script, not in the committed tool.
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 6: Typecheck/lint/format**

Run: `npm run typecheck && npm run lint && npm run format`
Expected: all exit 0.

- [ ] **Step 7: Hand off commit**

Files: `import/from-free-exercise-db.ts`, `import/README.md`, `import/from-free-exercise-db.test.ts`.
Message: `feat(domain): add free-exercise-db import transform`

---

### Task 10: Documentation updates + placeholder cleanup

Bring the repo docs in line with the new `src/` code, per our own process (the spec's "Documentation impact" section).

**Files:**

- Modify: `PROJECT_CONTEXT.md`
- Modify: `AGENTS.md`
- Delete: `types/placeholder.d.ts`
- Modify: `docs/features/backlog/001-fitness-domain-model.md` (fill `plan:` link)

**Interfaces:**

- Consumes: nothing (docs only).
- Produces: nothing downstream.

- [ ] **Step 1: Add `src/` to the `PROJECT_CONTEXT.md` folder map**

In `PROJECT_CONTEXT.md`, find:

```markdown
├── docs/
│ ├── features/ Feature kanban — cards move backlog/ → in-progress/ → done/
│ └── superpowers/
│ ├── specs/ Design docs produced by the brainstorming skill
│ └── plans/ Implementation plans produced by the writing-plans skill
```

Replace with:

```markdown
├── docs/
│ ├── features/ Feature kanban — cards move backlog/ → in-progress/ → done/
│ └── superpowers/
│ ├── specs/ Design docs produced by the brainstorming skill
│ └── plans/ Implementation plans produced by the writing-plans skill
├── src/
│ └── domain/
│ └── catalog/ Fitness catalog domain model (Zod schemas, loader, validator, seed)
```

- [ ] **Step 2: Remove the obsolete "no src/" note in `PROJECT_CONTEXT.md`**

In `PROJECT_CONTEXT.md`, find:

```markdown
There is no `src/` yet — the app itself (Expo/React Native, feature-organized
per AGENTS.md §3) is scaffolded in phase 2. This section gets rewritten with
real feature folders once that lands.
```

Replace with:

```markdown
`src/domain/catalog/` is the first application code — the fitness catalog domain
model (feature `001`). Expo/React Native UI scaffolding still comes in a later
feature; more `src/` feature folders will be added then.
```

- [ ] **Step 3: Remove the `placeholder.d.ts` quirk in `PROJECT_CONTEXT.md`**

In `PROJECT_CONTEXT.md`, find and DELETE this quirk bullet (real source now gives `tsc` inputs):

```markdown
- **`types/placeholder.d.ts` exists with no real content.** `tsc --noEmit`
  (used in CI/`npm run typecheck`) needs at least one file to type-check
  before the app is scaffolded. Delete this once real source files exist —
  it should not survive into phase 2.
```

Also remove the `types/` line from the folder-map code block:

```markdown
├── types/ Ambient TypeScript declarations (placeholder.d.ts
│ exists only to give tsc a root file pre-phase-2)
```

- [ ] **Step 4: Delete `types/placeholder.d.ts`**

Delete the file `types/placeholder.d.ts` (filesystem delete, not `git rm`). If the `types/` directory is now empty, leave it — git won't track it, and removing it is unnecessary.

- [ ] **Step 5: Update `AGENTS.md` §4 Testing & Verification**

In `AGENTS.md`, find:

```markdown
- **Planned framework:** Jest + React Native Testing Library (added in phase 2).
```

Replace with:

```markdown
- **Test frameworks:** the pure-TypeScript domain layer uses **Vitest**
  (`npm run test`). React Native component/UI tests will use jest-expo + React
  Native Testing Library when the app is scaffolded. Use Vitest for anything
  that isn't a rendered RN component.
```

- [ ] **Step 6: Add `npm run test` to the `AGENTS.md` tooling table**

In `AGENTS.md`, find:

```markdown
| `npm run typecheck` | Type-check (`tsc --noEmit`) |
```

Replace with:

```markdown
| `npm run typecheck` | Type-check (`tsc --noEmit`) |
| `npm run test` | Run unit tests (Vitest) |
```

- [ ] **Step 7: Fill the `plan:` link on the `001` card**

In `docs/features/backlog/001-fitness-domain-model.md`, find:

```markdown
plan:
```

Replace with:

```markdown
plan: docs/superpowers/plans/fitness-domain-model/July_2026/2026-07-26-fitness-domain-model.md
```

- [ ] **Step 8: Verify typecheck, lint, tests, format**

Run: `npm run typecheck && npm run lint && npm run test && npm run format`
Expected: all exit 0; `tsc` still has inputs (the `src/**/*.ts` files) after deleting the placeholder.

- [ ] **Step 9: Verify format:check is clean**

Run: `npm run format:check`
Expected: PASS.

- [ ] **Step 10: Hand off commit**

Files: `PROJECT_CONTEXT.md`, `AGENTS.md`, `docs/features/backlog/001-fitness-domain-model.md`, and the deletion of `types/placeholder.d.ts`.
Message: `docs(domain): update PROJECT_CONTEXT and AGENTS for the domain model`

Note (user's decision, not an implementer step): moving the `001` card from
`backlog/` to `in-progress/` (and later `done/`) is a `git mv` you perform, per
`development_process.md`.

---

## Verification (whole plan)

After all tasks:

- [ ] `npm run test` — all suites pass, including the seed integrity guard (`validateCatalog(seedCatalog)` returns `[]`).
- [ ] `npm run typecheck` — passes with the `src/` code and no `placeholder.d.ts`.
- [ ] `npm run lint` and `npm run format:check` — pass.
- [ ] `src/domain/catalog/index.ts` exports all eight modules (ids, enums, muscle-group, equipment, exercise, regime, catalog, validate).
- [ ] Branded ids used throughout; no `status`-style drift between schema names (`<Name>Schema`) and types (`<Name>`).
- [ ] `types/placeholder.d.ts` is gone; `PROJECT_CONTEXT.md` and `AGENTS.md` reflect `src/` + Vitest.
- [ ] No git write commands were run by implementers; all changes handed to the user for commit.

```

```
