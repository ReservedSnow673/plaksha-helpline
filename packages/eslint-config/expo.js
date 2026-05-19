/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['./index.js', 'expo'],
  rules: {
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
  },
};
