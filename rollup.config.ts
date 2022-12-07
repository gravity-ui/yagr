import fs from 'fs';

import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';
import scss from 'rollup-plugin-scss';
import {terser} from 'rollup-plugin-terser';
import del from 'rollup-plugin-delete';

const iife = (min, input, name, fileName, cssFileName = '') => ({
    input: input,
    output: {
        name,
        format: 'iife',
        file: min ? `./dist/${fileName}.min.js` : `./dist/${fileName}.js`,
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
        commonjs(),
        resolve(),
        cssFileName &&
            scss({
                output: (styles) => {
                    fs.writeFileSync('dist/' + cssFileName, styles);
                },
                outputStyle: min ? 'compressed' : 'expanded',
            }),
        min &&
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
                },
            }),
    ].filter(Boolean),
});

const css = (min) => ({
    input: 'src/Yagr.scss',
    plugins: [
        scss({
            output: (css) => {
                fs.writeFileSync('dist/index.css', css);
            },
            outputStyle: min ? 'compressed' : 'expanded',
        }),
        del({targets: 'dist/**/*.scss'}),
    ],
});

const main = [
    {
        input: `src/index.ts`,
        output: [
            {file: './dist/yagr.umd.js', name: 'yagr', format: 'umd', sourcemap: true},
            {file: './dist/yagr.es5.js', format: 'es', sourcemap: true},
        ],
        external: [],
        watch: {
            include: 'src/**',
        },
        plugins: [
            json(),
            typescript({
                useTsconfigDeclarationDir: true,
                tsconfig: './tsconfig.publish.json',
            }),
            commonjs(),
            resolve(),
            sourceMaps(),
        ],
    },
    css(true),
    css(false),
    iife(true, './src/YagrCore/index.ts', 'Yagr', 'yagr.iife'),
    iife(false, './src/YagrCore/index.ts', 'Yagr', 'yagr.iife'),
];

const plugins = [
    iife(true, './src/plugins/labels/labels.ts', 'YagrLabels', 'plugins/yagr.labels', 'plugins/yagr.labels.min.css'),
    iife(false, './src/plugins/labels/labels.ts', 'YagrLabels', 'plugins/yagr.labels', 'plugins/yagr.labels.css'),
    iife(true, './src/plugins/weekends/weekends.ts', 'YagrWeekends', 'plugins/yagr.weekends'),
    iife(false, './src/plugins/weekends/weekends.ts', 'YagrWeekends', 'plugins/yagr.weekends'),
];

export default process.argv.pop() === '--plugins' ? plugins : main;
