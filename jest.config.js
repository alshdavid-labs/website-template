const path = require('path');

const rootDirectory = path.resolve(__dirname, '../../');

module.exports = {
  collectCoverageFrom: [
    'src/**/*.{ts,js,tsx,jsx}',
    '!src/**/index.ts',
    '!src/customTypings.d.ts'
  ],
  coverageDirectory: 'reports/coverage',
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node'
  ],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/.jest/mocks/jest-file-mock.js',
    '\\.(css|less|scss|sass)$': '<rootDir>/.jest/mocks/jest-style-mock.js',
  },
  reporters: [
    'default',
    'jest-junit'
  ],
  testRegex: '.*\\.spec\\.(jsx?|tsx?)$',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  transformIgnorePatterns: [
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/build/'
  ],
  globals: {
    __environment: {}
  }
}
