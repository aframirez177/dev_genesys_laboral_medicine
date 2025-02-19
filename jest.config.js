module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.js'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    verbose: true
  };