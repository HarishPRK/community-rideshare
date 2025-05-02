module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  plugins: ['react', 'react-hooks'],
  rules: {
    // Disable or relax rules that might be causing issues in your deployment
    'no-unused-vars': 'warn',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/display-name': 'off',
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // Add more relaxed rules as needed
    'react/jsx-no-undef': 'error',
    'react/jsx-no-duplicate-props': 'warn',
    'react/jsx-key': 'warn',
    'react/no-direct-mutation-state': 'error'
  },
  ignorePatterns: ['build/', 'node_modules/', '*.min.js', 'dist/']
};
