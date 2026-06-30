module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', 'src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
  verbose: true,
};
