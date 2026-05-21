module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: ['**/*.ts', '!**/*.module.ts', '!**/*.dto.ts'],
  coverageDirectory: '../coverage',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
