module.exports = {
  root: true,
  extends: ['@plaksha/eslint-config/node'],
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
};
