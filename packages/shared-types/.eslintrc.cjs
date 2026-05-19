module.exports = {
  root: true,
  extends: ['@plaksha/eslint-config'],
  parserOptions: { tsconfigRootDir: __dirname, project: './tsconfig.json' },
};
