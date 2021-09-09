module.exports = {
    plugins: ["jest"],
    env: {
        'jest/globals': true,
    },
    globals: {
        'module': 'writeable',
        'global': 'writable',
        'HTMLCanvasElement': 'writeable'
    }
};
