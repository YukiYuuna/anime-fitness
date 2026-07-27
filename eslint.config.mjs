import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      'node_modules',
      'dist',
      'build',
      'web-build',
      '.expo',
      'coverage',
      'babel.config.cjs',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
);
