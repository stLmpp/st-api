// @ts-ignore
import pluginUnicorn from 'eslint-plugin-unicorn';
import globals from 'globals';

export default [
  'eslint:recommended',
  {
    plugins: {
      unicorn: pluginUnicorn,
    },
    rules: pluginUnicorn.configs.recommended.rules,
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-inner-declarations': ['off'],
      'object-shorthand': ['error'],
      'object-curly-spacing': ['error', 'always'],
      'arrow-parens': ['error', 'always'],
      'brace-style': ['off', 'off'],
      'id-blacklist': 'off',
      'id-match': 'off',
      'linebreak-style': 'off',
      'new-parens': 'off',
      'newline-per-chained-call': 'off',
      'no-extra-semi': 'off',
      'no-irregular-whitespace': 'off',
      'no-trailing-spaces': [
        'error',
        { ignoreComments: true, skipBlankLines: true },
      ],
      'no-underscore-dangle': 'off',
      'space-in-parens': ['off', 'never'],
      quotes: [
        'error',
        'single',
        { allowTemplateLiterals: true, avoidEscape: true },
      ],
      'no-console': ['warn'],
      curly: ['error', 'multi-line'],
      'no-useless-constructor': ['off'],
      'comma-dangle': [
        'error',
        {
          objects: 'always-multiline',
          arrays: 'always-multiline',
          functions: 'never',
          imports: 'always-multiline',
          exports: 'always-multiline',
        },
      ],
      'arrow-body-style': ['error', 'as-needed'],
      'prefer-arrow-callback': ['error'],
      'no-shadow': ['error'],
      'prefer-const': ['error', { destructuring: 'all' }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'import/no-unresolved': ['off'],
    },
  },
];
