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
