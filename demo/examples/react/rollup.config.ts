import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';
import babel from '@rollup/plugin-babel';

const getTsConfigAbsolutePath = (tsconfig) => {
    const path = require('path');
    const cwd = process.cwd();
    const tsconfigPath = path.resolve(cwd, tsconfig || 'tsconfig.json');
    return tsconfigPath;
};

export default [
    {
        input: `${__dirname}/react.example.js`,
        output: [{file: __dirname + '/react.example.umd.js', name: 'YagrReact', format: 'umd'}],
        plugins: [
            json(),
            typescript({
                useTsconfigDeclarationDir: true,
                tsconfig: getTsConfigAbsolutePath('tsconfig.publish.json'),
            }),
            babel({
                babelHelpers: 'bundled',
                presets: ['@babel/preset-react'],
            }),
            commonjs(),
            resolve(),
        ],
    },
    {
        input: `${__dirname}/react-tooltip.example.js`,
        output: [{file: __dirname + '/react-tooltip.example.umd.js', name: 'YagrReact', format: 'umd'}],
        plugins: [
            json(),
            typescript({
                useTsconfigDeclarationDir: true,
                tsconfig: getTsConfigAbsolutePath('tsconfig.publish.json'),
            }),
            babel({
                babelHelpers: 'bundled',
                presets: ['@babel/preset-react'],
            }),
            commonjs(),
            resolve(),
        ],
    },
];
