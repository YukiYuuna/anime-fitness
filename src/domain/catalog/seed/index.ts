import { loadCatalog, type Catalog } from '../catalog';
import muscleGroups from './muscle-groups.json';
import equipment from './equipment.json';
import exercises from './exercises.json';
import regimes from './regimes.json';

export const seedCatalog: Catalog = loadCatalog({ muscleGroups, equipment, exercises, regimes });
