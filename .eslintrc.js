const off = 0;
const warn = 1;
const error = 2;
module.exports = {
   // Stop ESLint from looking for a configuration file in parent folders
   root: true,

   plugins: ['@typescript-eslint', 'jest', 'import'],
   env: {
      browser: true,
      es2017: true,
      node: true,
   },
   extends: [
      'eslint:recommended',
      'plugin:import/errors',
      'plugin:import/warnings',
      'plugin:import/typescript',
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
      'plugin:jest/recommended',
      'plugin:jest/style',
      'prettier',
      'prettier/@typescript-eslint',
   ],
   parser: '@typescript-eslint/parser',
   parserOptions: {
      ecmaVersion: 2017,
      sourceType: 'module',
      project: ['./src/tsconfig.json', './tsconfig.eslint.json'],
      tsconfigRootDir: __dirname,
   },
   settings: {
      'import/parsers': {
         '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
         typescript: {
            project: ['src/tsconfig.json'],
         },
      },
   },
   rules: {
      'import/export': off,
      '@typescript-eslint/ban-types': [
         error,
         {
            extendDefaults: true,
            types: { object: false },
         },
      ],
      '@typescript-eslint/explicit-module-boundary-types': [
         warn,
         { allowArgumentsExplicitlyTypedAsAny: true },
      ],
      '@typescript-eslint/no-namespace': off,
      '@typescript-eslint/no-non-null-assertion': off,
      '@typescript-eslint/no-explicit-any': off,
      '@typescript-eslint/no-unsafe-assignment': off,
      '@typescript-eslint/no-unsafe-member-access': off,
      '@typescript-eslint/no-unsafe-return': off,
      '@typescript-eslint/restrict-template-expressions': off,
      curly: [error, 'multi-line'],
      'max-len': [error, { code: 95 }],
   },
};
