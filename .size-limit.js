function shareEntries(config) {
    config.splitting = true;
    config.format = 'esm';
    return config;
}

module.exports = [
    {
        name: 'ESM',
        path: 'dist/yagr.mjs',
        limit: '46 kB',
    },
    {
        name: 'CJS',
        path: 'dist/yagr.cjs',
        limit: '46 kB',
    },
    {
        name: 'IIFE',
        path: 'dist/yagr.iife.js',
        limit: '46 kB',
    },
    {
        name: 'UMD',
        path: 'dist/yagr.umd.js',
        limit: '46 kB',
    },
    {
        name: 'React ESM',
        path: 'dist/react.mjs',
        limit: '2 kB',
        ignore: ['react', '@gravity-ui/yagr'],
    },
    {
        name: 'React CJS',
        path: 'dist/react.cjs',
        limit: '2.5 kB',
        ignore: ['react', '@gravity-ui/yagr'],
    },
    {
        name: 'ESM + React',
        path: ['dist/yagr.mjs', 'dist/react.mjs'],
        limit: '52 kB',
        modifyEsbuildConfig: shareEntries,
    },
    {
        name: 'CJS + React',
        path: ['dist/yagr.cjs', 'dist/react.cjs'],
        limit: '52 kB',
        modifyEsbuildConfig: shareEntries,
    },
    {
        name: 'labels',
        path: 'dist/plugins/labels/labels.iife.js',
        limit: '6 kB',
    },
    {
        name: 'labels UMD',
        path: 'dist/plugins/labels/labels.umd.js',
        limit: '6 kB',
    },
    {
        name: 'weekends',
        path: 'dist/plugins/weekends/weekends.iife.js',
        limit: '2 kB',
    },
    {
        name: 'weekends UMD',
        path: 'dist/plugins/weekends/weekends.umd.js',
        limit: '2.5 kB',
    },
    {
        name: 'aggregates',
        path: 'dist/plugins/aggregates/aggregates.iife.js',
        limit: '3 kB',
    },
    {
        name: 'aggregates UMD',
        path: 'dist/plugins/aggregates/aggregates.umd.js',
        limit: '4 kB',
    },
];
