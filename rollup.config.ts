import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';
import scss from 'rollup-plugin-scss';
import {terser} from 'rollup-plugin-terser';

const pkg = require('./package.json');
const libraryName = 'yagr';

export default {
    input: `src/index.ts`,
    output: [
        {file: pkg.main, name: libraryName, format: 'umd', sourcemap: true},
        {file: pkg.module, format: 'es', sourcemap: true, plugins: [terser()]},
    ],

    external: [],
    watch: {
        include: 'src/**',
    },
    plugins: [
        json(),
        typescript({useTsconfigDeclarationDir: true}),
        scss({
            output: true,
            bundle: 'yagr.css',
        }),
        commonjs(),
        resolve(),
        sourceMaps(),
    ],
};
