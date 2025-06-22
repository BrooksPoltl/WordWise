module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'airbnb',
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier', // This should be last to override other configs
  ],
  ignorePatterns: [
    'dist',
    '.eslintrc.cjs',
    'vite.config.ts',
    'tailwind.config.js',
    'postcss.config.js',
    'functions/**/*',
    'firebase-export-*/**/*',
    'emulator-data/**/*',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    'react-refresh',
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: ['./tsconfig.json', './tsconfig.node.json'],
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    // React Refresh
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],

    // TypeScript specific rules - STRICT MODE
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        ignoreRestSiblings: false,
      },
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/no-use-before-define': 'error',

    // React specific rules - STRICT MODE
    'react/react-in-jsx-scope': 'off', // Not needed with React 17+
    'react/jsx-uses-react': 'off', // Not needed with React 17+
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],
    'react/jsx-props-no-spreading': 'off', // Useful for component composition
    'react/require-default-props': 'off', // Not needed with TypeScript
    'react/prop-types': 'off', // Not needed with TypeScript
    'react/button-has-type': 'error',
    'react/self-closing-comp': 'error',
    'react/jsx-no-useless-fragment': 'error',
    'react/no-unescaped-entities': 'error',
    'react/jsx-boolean-value': 'error',
    'react/no-array-index-key': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',

    // Import rules
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never',
        tsx: 'never',
        js: 'never',
        jsx: 'never',
      },
    ],
    'import/prefer-default-export': 'off',
    'import/no-default-export': 'off',

    // General rules - STRICT MODE
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-unused-vars': 'off', // Using @typescript-eslint version
    'consistent-return': 'error',
    'no-else-return': 'error',
    'prefer-template': 'error',
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message: 'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
    ],

    // Firebase/Firestore related
    'no-param-reassign': [
      'error',
      {
        props: true,
        ignorePropertyModificationsFor: ['draft'], // For Immer
      },
    ],

    // Accessibility
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['hrefLeft', 'hrefRight'],
        aspects: ['invalidHref', 'preferButton'],
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/setupTests.ts'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      files: ['src/utils/logger.ts'],
      rules: {
        'no-console': 'off', // Logger is designed to use console
        '@typescript-eslint/no-explicit-any': 'off', // Logger needs flexible types
      },
    },
    {
      files: ['src/extensions/SpellCheckDecorations.ts', 'src/components/TextEditor.tsx'],
      rules: {
        'import/no-extraneous-dependencies': 'off', // Tiptap peer dependencies
        '@typescript-eslint/no-explicit-any': 'off', // ProseMirror/Tiptap types are complex
      },
    },
    {
      files: ['src/utils/spellChecker.ts', 'src/utils/toneAnalyzer.ts'],
      rules: {
        'class-methods-use-this': 'off', // Utility classes with static-like methods
      },
    },
    {
      files: ['vite.config.ts', 'tailwind.config.js', 'postcss.config.js'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      files: ['src/utils/editorCommands.ts'],
      rules: {
        'no-alert': 'off',
      },
    },
  ],
}; 