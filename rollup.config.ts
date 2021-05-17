import fs from 'fs';

import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';
import scss from 'rollup-plugin-scss';
import {terser} from 'rollup-plugin-terser';

const libraryName = 'yagr';

const iife = (min) => ({
    input: './src/YagrCore/index.ts',
    output: {
        name: 'Yagr',
        format: 'iife',
        file: min ? './dist/yagr.iife.min.js' : './dist/yagr.iife.js',
        esModule: false,
        exports: 'default',
    },
    context: 'this',
    plugins: [
        json(),
        typescript({
            typescript: require('typescript'),
            tsconfig: './tsconfig.publish.json',
            useTsconfigDeclarationDir: true,
            objectHashIgnoreUnknownHack: true,
        }),
        scss({
            output: true,
            bundle: 'yagr.css',
        }),
        commonjs(),
        resolve(),
        min && terser({
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
    ].filter(Boolean)
});

export default [{
    input: `src/index.ts`,
    output: [
        {file: './dist/yagr.umd.js', name: libraryName, format: 'umd', sourcemap: true, moduleContext: 'this', context: 'this'},
        {file: './dist/yagr.es5.js', format: 'es', sourcemap: true, moduleContext: 'this', context: 'this'},
    ],
    external: [],
    watch: {
        include: 'src/**',
    },
    plugins: [
        json(),
        typescript({
            useTsconfigDeclarationDir: true,
            tsconfig: './tsconfig.publish.json'
        }),
        scss({
            output: (styles) => {
                fs.writeFileSync('dist/index.css', styles);
            },
            bundle: 'index.css',
        }),
        commonjs(),
        resolve(),
        sourceMaps(),
    ],
}, iife(true), iife(false)];
