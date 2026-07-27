import { Pressable, type PressableProps } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

export function Button({ label, ...rest }: { label: string } & Omit<PressableProps, 'children'>) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      style={{
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: 8,
        alignItems: 'center',
      }}
      {...rest}
    >
      <Text variant="label">{label}</Text>
    </Pressable>
  );
}
