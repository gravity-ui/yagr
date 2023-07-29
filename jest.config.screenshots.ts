import type {Config} from '@jest/types';

const cfg: Config.InitialOptions = {
    preset: 'ts-jest',
    roots: ['<rootDir>/tests/screenshots'],
    globalTeardown: '<rootDir>/tests/screenshots/teardown.ts',
};

export default cfg;
