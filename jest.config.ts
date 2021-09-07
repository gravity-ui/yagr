import type {Config} from '@jest/types';

const cfg: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    collectCoverage: true,
    collectCoverageFrom: ['./src/**/*.{js,ts,tsx}'],
    coverageReporters: ['json', 'html'],
    coverageDirectory: './coverage',
    setupFiles: ['<rootDir>/tests/setup.js'],
};

export default cfg;
