import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';
import scss from 'rollup-plugin-scss';
import {terser} from 'rollup-plugin-terser';

const pkg = require('./package.json');
const libraryName = 'yagr';


export default [{
    input: `src/index.ts`,
    output: [
        {file: pkg.main, name: libraryName, format: 'umd', sourcemap: true},
        {file: pkg.module, format: 'es', sourcemap: true},
    ],
    external: [],
    watch: {
        include: 'src/**',
    },
    plugins: [
        json(),
        typescript({
            useTsconfigDeclarationDir: true,
        }),
        scss({
            output: true,
            bundle: 'yagr.css',
        }),
        commonjs(),
        resolve(),
        sourceMaps(),
    ],
}, {
    input: './src/YagrCore/index.ts',
    output: {
        name: 'Yagr',
        format: 'iife',
        file: './dist/yagr.iife.min.js',
        esModule: false,
        exports: 'default',
    },
    context: 'this',
    plugins: [
        json(),
        typescript({
            typescript: require('typescript'),
            useTsconfigDeclarationDir: true,
            objectHashIgnoreUnknownHack: true,
        }),
        scss({
            output: true,
            bundle: 'yagr.css',
        }),
        commonjs(),
        resolve(),
        terser({
            compress: {
                inline: 0,
                passes: 2,
                keep_fnames: false,
                keep_fargs: false,
                pure_getters: true,
            },
            output: {
                comments: /^!/,
            }
        }),
    ]
}];
