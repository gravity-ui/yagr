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

function build(entry, outfile, format, minify = false, plugins = []) {
    return buildFn({
        entryPoints: [entry],
        outfile,
        format,
        plugins,
        bundle: true,
        sourcemap: true,
        banner: {js: banner},
        platform: 'browser',
        logLevel: 'error',
    }).then((ctx) => {
        log(`${format.toUpperCase()} build for ${entry} finished`);

        if (minify) {
            esbuild
                .build({
                    entryPoints: [outfile],
                    outfile: outfile.replace('.js', '.min.js'),
                    banner: {js: banner},
                    sourcemap: true,
                    minify: true,
                })
                .then(() => {
                    console.log(`${format.toUpperCase()} minified build for ${entry} finished`);
                })
                .catch((e) => {
                    console.error(e);
                    process.exit(1);
                });
        }

        ctx;
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
    const esm = build('./src/index.ts', './dist/yagr.esm.js', 'esm', true);
    const iife = build('./src/index.ts', './dist/yagr.iife.js', 'iife', true);
    const cjs = build('./src/index.ts', './dist/yagr.cjs.js', 'cjs', false);
    const umd = build('./src/index.ts', './dist/yagr.umd.js', 'umd', true, [umdWrapper()]);

    return [scss, esm, iife, cjs, umd];
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

    const esm = build(`./src/plugins/${name}/${name}.ts`, `./dist/plugins/${name}/${name}.esm.js`, 'esm', true);
    const iife = build(`./src/plugins/${name}/${name}.ts`, `./dist/plugins/${name}/${name}.iife.js`, 'esm', true);
    const cjs = build(`./src/plugins/${name}/${name}.ts`, `./dist/plugins/${name}/${name}.cjs.js`, 'esm', true);
    const umd = build(`./src/plugins/${name}/${name}.ts`, `./dist/plugins/${name}/${name}.umd.js`, 'esm', true);

    return [scss, esm, iife, cjs, umd];
}

function buildPlugins() {
    return [buildPlugin('labels'), buildPlugin('weekends', false)];
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
            builds.push(...buildMain());
        } else if (process.argv.includes('--plugins')) {
            builds.push(...buildPlugins());
        } else if (process.argv.includes('--examples')) {
            builds.push(...buildExamples());
        } else {
            builds.push(...buildMain(), ...buildPlugins(), ...buildExamples());
        }

        const results = await Promise.all(builds);

        if (isDevMode) {
            for (const ctx of results) {
                const watcher = ctx.watch();

                console.log(watcher);
            }
        }
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
