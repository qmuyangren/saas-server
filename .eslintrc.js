module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'test/**/*'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off', // 允许 any 类型
    '@typescript-eslint/no-unsafe-assignment': 'off', // 允许 unsafe assignment
    '@typescript-eslint/no-unsafe-member-access': 'off', // 允许 unsafe member access
    '@typescript-eslint/no-unsafe-call': 'off', // 允许 unsafe call
    '@typescript-eslint/no-floating-promises': 'warn', // 改为警告
  },
};
