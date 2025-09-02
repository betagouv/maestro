import reactHooks from 'eslint-plugin-react-hooks';
import storybook from 'eslint-plugin-storybook';
import { globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import commonConfig from '../eslint.config.mjs';

export default tseslint.config([
  globalIgnores(['**/node_modules/', '**/build/', '**/public/', '**/dist/']),
  commonConfig,
  reactHooks.configs['recommended-latest'],
  {
    rules: {
      'react-hooks/exhaustive-deps': 'error'
    }
  },
  ...storybook.configs['flat/recommended'],
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ],

      'no-irregular-whitespace': 'off'
    }
  }
]);
