import { ExerciseSchema, type Exercise } from '../exercise';
import type { Difficulty, MovementCategory, TrainedAttribute } from '../enums';

export interface FreeExerciseDbRecord {
  name: string;
  force: 'push' | 'pull' | 'static' | null;
  level: 'beginner' | 'intermediate' | 'expert';
  // Retained for source-shape completeness; not currently used by toTrainedAttributes' heuristic.
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
