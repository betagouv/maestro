import js from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

export default tseslint.config([
  js.configs.recommended,
  tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',

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

      '@typescript-eslint/no-var-requires': 'off',

      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^Maestro/]',
          message: 'Use Brand instead.'
        },
        {
          selector:
            'MemberExpression[object.name=/(Checked|Refined)$/][property.name=/^(pick|omit|extend)$/]',
          message:
            'Cannot use .pick(), .omit(), or .extend() on variables ending with "Checked" or "Refined".'
        },
        {
          selector:
            'VariableDeclarator[init.callee.property.name="check"][id.name!=/Checked$/]',
          message: 'Variables constructed with .check() must end with "Checked".'
        },
        {
          selector:
            'VariableDeclarator[init.callee.property.name=/^(refine|superRefine)$/][id.name!=/Refined$/]',
          message:
            'Variables constructed with .refine() or .superRefine() must end with "Refined".'
        }
      ]
    }
  }
]);
