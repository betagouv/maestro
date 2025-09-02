import { globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import commonConfig from '../eslint.config.mjs';

export default tseslint.config([
  globalIgnores(['**/node_modules/', '**/database/', '**/dist/']),

  commonConfig,
  {
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: '__dirname',
          message: 'Use import.meta.dirname instead.'
        }
      ]
    }
  }
]);
