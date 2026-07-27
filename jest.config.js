module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.tsx$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/backend/src/core/$1',
    '^@common/(.*)$': '<rootDir>/backend/src/common/$1',
    '^@modules/(.*)$': '<rootDir>/backend/src/modules/$1',
    '^@shared/(.*)$': '<rootDir>/backend/src/shared/$1',
    '^@/(.*)$': '<rootDir>/src/shared/$1',
  },
  collectCoverageFrom: [
    'backend/src/**/*.ts',
    'src/shared/lib/**/*.ts',
    'src/shared/hooks/**/*.ts',
    '!**/*.d.ts',
    '!**/*.spec.ts',
    '!**/*.test.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testTimeout: 30000,
};
