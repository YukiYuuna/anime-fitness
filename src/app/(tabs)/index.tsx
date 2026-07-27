import { seedCatalog } from '@/domain/catalog/seed';
import { Screen, Text } from '@/components';

export default function HomeScreen() {
  const exerciseCount = seedCatalog.exercises.length;
  return (
    <Screen>
      <Text variant="title">anime-fitness</Text>
      <Text variant="body">{exerciseCount} exercises in the catalog</Text>
    </Screen>
  );
}
