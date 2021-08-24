const fs = require('fs');
const transform = require('@doc-tools/transform');
const {resolve} = require('path');

const content = fs.readFileSync(resolve(__dirname, './docs.en.md'), 'utf8');

const {result: {html, meta}} = transform(content, {});

console.log('Meta:', meta);

fs.writeFileSync(resolve(__dirname, 'dist/docs/docs.en.html'), html);
