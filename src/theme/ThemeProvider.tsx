import { createContext, useContext, type ReactNode } from 'react';
import { tokens, type Theme } from './tokens';

const ThemeContext = createContext<Theme>(tokens);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <ThemeContext.Provider value={tokens}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
