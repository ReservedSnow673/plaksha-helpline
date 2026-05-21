module.exports = {
  root: true,
  extends: ['@plaksha/eslint-config/node'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
  },
};
