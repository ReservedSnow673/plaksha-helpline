module.exports = {
  root: true,
  extends: ['@plaksha/eslint-config/next'],
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
};
