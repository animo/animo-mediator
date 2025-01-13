import type { Config } from '@jest/types'

import packageJson from './package.json'

const config: Config.InitialOptions = {
  displayName: packageJson.name,
  testTimeout: 120000,
  preset: 'ts-jest',
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/build/', '/node_modules/', '/__tests__/', 'tests'],
  coverageDirectory: '<rootDir>/coverage/',
  verbose: true,
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  transform: {
    '.+\\.ts': ['ts-jest', { isolatedModules: true }],
  },
}

export default config
