/* eslint-disable */

const esbuild = require('esbuild');
const {umdWrapper} = require('esbuild-plugin-umd-wrapper');
const {sassPlugin} = require('esbuild-sass-plugin');

const version = require('./package.json').version;
const isDevMode = process.argv.includes('--dev');
const banner = [
    '/**',
    '* Copyright (c) ' + new Date().getFullYear() + ', Yandex LLC',
    '* All rights reserved. (MIT Licensed)',
    '*',
    '* Yagr@' + version + '',
    '* High-performance HTML5 canvas chart renderer based on uPlot',
    '* https://github.com/gravity-ui/yagr',
    '*/',
    '',
].join('\n');

const buildFn = isDevMode ? esbuild.context : esbuild.build;
const log = (str) => console.log(str + (isDevMode ? ' (waiting for changes ...)' : ''));

function build(entry, outfile, format, minify = false, plugins = [], external = []) {
    return buildFn({
        entryPoints: [entry],
        outfile,
        format,
        plugins,
        external,
        bundle: true,
        sourcemap: true,
        banner: {js: banner},
        platform: 'browser',
        target: 'es2019',
        logLevel: 'error',
    }).then(async (ctx) => {
        log(`${format.toUpperCase()} build for ${entry} finished`);

        if (minify) {
            await esbuild.build({
                entryPoints: [outfile],
                outfile: outfile.replace(/(\.[^.]+)$/, '.min$1'),
                banner: {js: banner},
                sourcemap: true,
                minify: true,
                target: 'es2019',
            });
            console.log(`${format.toUpperCase()} minified build for ${entry} finished`);
        }

        return ctx;
    });
}

function buildMain() {
    /** Build SCSS */
    const scss = buildFn({
        entryPoints: ['./src/Yagr.scss'],
        outfile: './dist/index.css',
        plugins: [sassPlugin()],
    }).then((ctx) => {
        console.log('SCSS build finished');

        esbuild
            .build({
                entryPoints: ['./dist/index.css'],
                outfile: './dist/index.min.css',
                minify: true,
            })
            .then(() => {
                console.log('CSS minified');
            })
            .catch((e) => {
                console.error(e);
                process.exit(1);
            });

        return ctx;
    });

    /** Build ESM */
    const esm = build('./src/index.ts', './dist/yagr.mjs', 'esm', true);
    const iife = build('./src/index.ts', './dist/yagr.iife.js', 'iife', true);
    const cjs = build('./src/index.ts', './dist/yagr.cjs', 'cjs', false);
    const umd = build('./src/index.ts', './dist/yagr.umd.js', 'umd', true, [umdWrapper()]);
    const reactEsm = build('./src/react.tsx', './dist/react.mjs', 'esm', false, [], ['react']);
    const reactCjs = build('./src/react.tsx', './dist/react.cjs', 'cjs', false, [], ['react']);

    return [scss, esm, iife, cjs, umd, reactEsm, reactCjs].filter(Boolean);
}

function buildPlugin(name, css = false) {
    const scss = css
        ? buildFn({
              entryPoints: [`./src/plugins/${name}/styles.scss`],
              outfile: `./dist/plugins/${name}/${name}.css`,
              plugins: [sassPlugin()],
          }).then((ctx) => {
              console.log(`CSS for ${name} plugin built`);

              esbuild
                  .build({
                      entryPoints: [`./dist/plugins/${name}/${name}.css`],
                      outfile: `./dist/plugins/${name}/${name}.min.css`,
                      minify: true,
                  })
                  .then(() => {
                      console.log(`CSS for ${name} plugin minified`);
                  });

              return ctx;
          })
        : Promise.resolve();

    const iife = build(`./src/plugins/${name}/${name}.ts`, `./dist/plugins/${name}/${name}.iife.js`, 'iife', true);
    const umd = build(`./src/plugins/${name}/${name}.ts`, `./dist/plugins/${name}/${name}.umd.js`, 'umd', true, [
        umdWrapper(),
    ]);

    return [scss, iife, umd].filter(Boolean);
}

function buildPlugins() {
    return buildPlugin('labels', true).concat(buildPlugin('weekends')).concat(buildPlugin('aggregates')).filter(Boolean);
}

function buildExamples() {
    const tooltip = buildFn({
        entryPoints: ['./demo/examples/react/react-tooltip.example.js'],
        outfile: './demo/examples/react/react-tooltip.example.esm.js',
        format: 'esm',
        loader: {'.js': 'jsx'},
        bundle: true,
        sourcemap: false,
        platform: 'browser',
        logLevel: 'error',
    }).then((result) => {
        log('React tooltip example build finished');

        return result;
    });

    const component = buildFn({
        entryPoints: ['./demo/examples/react/react.example.js'],
        outfile: './demo/examples/react/react.example.esm.js',
        format: 'esm',
        loader: {'.js': 'jsx'},
        bundle: true,
        sourcemap: false,
        platform: 'browser',
        logLevel: 'error',
    }).then((result) => {
        log('React Component example build finished');

        return result;
    });

    return [tooltip, component];
}

async function run() {
    const builds = [];

    try {
        if (process.argv.includes('--main')) {
            console.log('Building main Yagr modules');
            builds.push(...buildMain());
        } else if (process.argv.includes('--plugins')) {
            console.log('Building Yagr plugins');
            builds.push(...buildPlugins());
        } else if (process.argv.includes('--examples')) {
            console.log('Building Yagr examples');
            builds.push(...buildExamples());
        } else {
            builds.push(...buildMain(), ...buildPlugins(), ...buildExamples());
        }

        const results = await Promise.all(builds);
        if (isDevMode) {
            const watches = [];
            for (const ctx of results) {
                if (!ctx?.watch) {
                    continue;
                }

                watches.push(ctx.watch());
            }

            await Promise.all(watches);
        }
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
