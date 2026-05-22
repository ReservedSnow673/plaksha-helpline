module.exports = {
  root: true,
  extends: ['@plaksha/eslint-config/expo'],
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
};
