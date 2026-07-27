import { Text as RNText, type TextProps } from 'react-native';
import { useTheme } from '@/theme';

type Variant = 'title' | 'body' | 'label';

export function Text({ variant = 'body', style, ...rest }: TextProps & { variant?: Variant }) {
  const theme = useTheme();
  const typo = theme.typography[variant];
  return (
    <RNText
      style={[
        { color: theme.colors.text, fontSize: typo.fontSize, fontWeight: typo.fontWeight },
        style,
      ]}
      {...rest}
    />
  );
}
