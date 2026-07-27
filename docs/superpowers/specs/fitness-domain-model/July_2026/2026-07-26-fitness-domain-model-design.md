# Fitness Domain Model (001) — Design

**Date:** 2026-07-26
**Feature:** `001-fitness-domain-model`
**Backlog card:** `docs/features/backlog/001-fitness-domain-model.md`
**Status:** Approved — ready for implementation planning

## Problem

anime-fitness needs a foundation of fitness content before any screen can be
built: what exercises exist, what each one trains, and how exercises combine
into a workout. This is the first real code in the repo (Phase 2). Everything
downstream — workout screens, progress tracking, the eventual "train like anime
character X" mapping — depends on a well-shaped catalog existing first.

## Scope

**In scope — the catalog layer only:** reference content that is read-mostly and
seed-able (exercises, the muscles/attributes they train, equipment, and regime
templates).

**Out of scope (separate future specs):**

- User activity — logging sessions, sets/reps actually performed, progress over time.
- The anime-character → regime mapping.
- Any UI, navigation, or persistence/backend. This feature is pure TypeScript
  models + seed data + validation, consumed in-memory.

## Requirements

The design below must satisfy all of these:

- **Entities:** `Exercise`, `MuscleGroup`, `Equipment`, `Regime` (each with an id);
  plus three closed enums: `MovementCategory`, `Difficulty`, `TrainedAttribute`.
- **A `Regime` is a template, not a log:** a named, ordered list of entries; each
  entry is an exercise plus a sets/reps/rest prescription.
- **Reps support ranges** (e.g. 8–12), with a fixed count expressed as a range
  whose min equals its max.
- **Rest is optional** on a regime entry.
- **`TrainedAttribute` is our authored augmentation** — free-exercise-db has no
  equivalent field.
- **Zod schemas are the single source of truth;** TS types are inferred from them.
- **Data seeds from free-exercise-db** (public domain); a small real seed dataset
  must exist and be validated.
- **Guaranteed behaviors:** every id reference resolves; no duplicate ids within
  an entity type; bad/missing fields in imported or seed data fail loudly at
  load, not silently.

## Design

### Ids and enums

Ids are **branded** strings (Zod `.brand()`), so the compiler rejects passing a
`MuscleGroupId` where an `ExerciseId` is expected — the error class this
reference-heavy model is most prone to.

- `ExerciseId`, `MuscleGroupId`, `EquipmentId`, `RegimeId` — `z.string().min(1).brand<'…'>()`.

Three closed enums (Zod enums; union types inferred):

- `MovementCategory` = `push | pull | legs | core | full_body`
- `Difficulty` = `beginner | intermediate | advanced`
- `TrainedAttribute` = `strength | endurance | speed | power | mobility`

### Entity schemas

Zod is the source of truth; each type is `z.infer<typeof …Schema>`.

```
MuscleGroup { id: MuscleGroupId; name: string }
Equipment   { id: EquipmentId;   name: string }

Exercise {
  id: ExerciseId
  name: string
  primaryMuscleIds: MuscleGroupId[]      // min 1
  secondaryMuscleIds: MuscleGroupId[]    // default []
  equipmentIds: EquipmentId[]            // default [] (e.g. bodyweight)
  movementCategory: MovementCategory
  difficulty: Difficulty
  trainedAttributes: TrainedAttribute[]  // min 1 (authored)
  instructions: string[]                 // default []; from free-exercise-db
}

RepRange    { min: int >= 1; max: int >= min }
RegimeEntry { exerciseId: ExerciseId; sets: int >= 1; reps: RepRange; restSeconds?: int >= 0 }
Regime      { id: RegimeId; name: string; description?: string; entries: RegimeEntry[] }  // entries: min 1, ordered
```

`RepRange` is refined so `max >= min`; a fixed prescription is `{ min: n, max: n }`.
`Regime.entries` order is significant (array order = workout order).

### Catalog aggregate

A `Catalog` bundles the four record collections:

```
Catalog { muscleGroups: MuscleGroup[]; equipment: Equipment[]; exercises: Exercise[]; regimes: Regime[] }
```

- `loadCatalog(sources)` parses each seed collection through its Zod schema and
  returns a typed `Catalog`, **throwing** on the first schema violation (loud
  failure on bad/missing fields).
- `validateCatalog(catalog)` enforces cross-entity rules Zod cannot express
  alone and returns a list of human-readable errors (empty = valid):
  - ids unique within each collection;
  - every `primaryMuscleIds` / `secondaryMuscleIds` resolves to a `MuscleGroup`;
  - every `equipmentIds` resolves to an `Equipment`;
  - every `RegimeEntry.exerciseId` resolves to an `Exercise`;
  - every `Exercise` has ≥1 primary muscle and ≥1 trained attribute (belt-and-suspenders with the schema).

### File structure

First code in the repo. Organized by feature per AGENTS.md §3, one
responsibility per file.

```
src/domain/catalog/
  ids.ts                    branded id schemas
  enums.ts                  MovementCategory, Difficulty, TrainedAttribute
  muscle-group.ts           schema + inferred type
  equipment.ts              schema + inferred type
  exercise.ts               schema + inferred type
  regime.ts                 RepRange, RegimeEntry, Regime schemas + types
  catalog.ts                Catalog type, loadCatalog()
  validate.ts               validateCatalog() referential-integrity checks
  index.ts                  public API surface
  seed/
    muscle-groups.json
    equipment.json
    exercises.json
    regimes.json
  import/
    from-free-exercise-db.ts   one-off dev transform (never runs in-app)
    README.md                  how to regenerate the seed
```

### Seed & import strategy

- **No runtime dependency on free-exercise-db.** A one-off dev script,
  `import/from-free-exercise-db.ts`, reads a locally-placed copy of the
  free-exercise-db JSON, selects a curated subset (~30–50 exercises spanning the
  movement categories and difficulty levels), transforms each record into our
  shape, and writes the seed JSON. The script is kept for regeneration but is not
  imported by app code.
- **Field mapping** from free-exercise-db → our model:
  - `name` → `name`; `instructions` → `instructions`.
  - `level` → `difficulty` (`expert` maps to `advanced`).
  - `primaryMuscles` / `secondaryMuscles` → resolved to `MuscleGroup` ids;
    `equipment` (single value, may be null) → `equipmentIds` (0 or 1 entry).
  - `muscle-groups.json` and `equipment.json` are the distinct vocabularies used
    by the chosen subset (stable slug-style ids, e.g. `quadriceps`, `barbell`).
- **Authored fields** (no source equivalent), filled by a documented heuristic
  during transform, then hand-curated:
  - `movementCategory` — heuristic: primary muscle in {quadriceps, hamstrings,
    glutes, calves, adductors, abductors} → `legs`; in {abdominals, lower back} →
    `core`; else free-exercise-db `force` push→`push`, pull→`pull`; fallback
    `full_body`.
  - `trainedAttributes` — heuristic seeded from `category`/`mechanic` (e.g.
    strength/powerlifting+compound → `strength`; cardio → `endurance`;
    stretching → `mobility`; plyometrics → `speed`/`power`), then curated.
- **`regimes.json`** holds 2–3 example regimes referencing seeded exercise ids,
  demonstrating rep ranges and optional rest.

### Validation & testing

Test runner: **Vitest** for this pure-TS domain package — ESM-native (the repo
is `"type": "module"`), near-zero config, fast. React Native component tests
will still use jest-expo later, per AGENTS.md. This feature introduces the
initial Vitest setup.

Tests (TDD, written before implementation):

- **Per-schema unit tests** — each entity schema accepts a valid object and
  rejects representative invalid ones (missing required field, wrong enum value,
  `RepRange` with `max < min`, empty `primaryMuscleIds`).
- **`validateCatalog` unit tests** — hand-built catalogs exercise each failure
  mode: duplicate id, dangling muscle/equipment/exercise reference, missing
  primary muscle. A clean catalog returns zero errors.
- **Seed integrity test (the key guard)** — the committed seed loads via
  `loadCatalog()` and passes `validateCatalog()` with **zero errors**, so a
  broken seed fails CI.
- **Transform mapping test** — a sample free-exercise-db record transforms into a
  schema-valid `Exercise` with the expected mapped fields.

## Documentation impact (required by our own process)

Implementation must, in the same branch:

- Add `src/` (and `src/domain/catalog/`) to the `PROJECT_CONTEXT.md` folder map;
  remove the "There is no `src/` yet" note and the now-obsolete
  `types/placeholder.d.ts` quirk if that placeholder is deleted.
- Update AGENTS.md §4: record that the domain/pure-TS layer uses **Vitest** while
  RN components will use jest-expo — so the "Jest" mention is no longer the whole
  story. Add `npm run test` (Vitest) to the tooling commands.
- Move the `001` card to `in-progress/` at start and `done/` on merge, and fill
  its `spec:`/`plan:` links, per `development_process.md`.

## Open questions

None blocking. The exact curated exercise subset and the final hand-curated
`movementCategory`/`trainedAttributes` values are implementation details settled
during the transform, not design decisions.
