module.exports = {
  verbose: true,
  preset: 'ts-jest',
  rootDir: './',
  testEnvironment: 'jsdom',
  roots: [
    '<rootDir>'
  ],
  modulePaths: [
    '<rootDir>'
  ],
  moduleNameMapper: {
    '^.+\\.(css|less|scss)$': 'babel-jest',
    '^actions/(.*)$': '<rootDir>/src/actions/$1',
    '^components/(.*)$': '<rootDir>/src/components/$1',
    '^reducers(.*)$': '<rootDir>/src/reducers/$1',
    '^reducers(.*)$': '<rootDir>/src/reducers/$1',
    '^./jobs-filter-configuration$': '<rootDir>/src/components/jobs-page/jobs-filter-configuration.ts',
    '^icons$': '<rootDir>/src/icons.tsx',
    '^cvat-core/src/enums$': '<rootDir>/src/tests/mocks/enums.js',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleDirectories: [
    'node_modules'
  ],
  testRegex: '.*\\.test\\.ts[x]$',
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
    '^.+\\.svg$': '<rootDir>/svgTransformer.js'
  },
  setupFilesAfterEnv: ['<rootDir>/setupTest.ts'],
  transformIgnorePatterns: ['node_modules'],
  coverageReporters: [
    ["cobertura", { "file": "cobertura.xml" }]
  ],
};