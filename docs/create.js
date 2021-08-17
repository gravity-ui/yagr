const fs = require('fs');
const transform = require('@doc-tools/transform');
const {resolve} = require('path');

const content = fs.readFileSync(resolve(__dirname, './docs.en.md'), 'utf8');
const vars = { user: { name: 'Alice' } };

const {result: {html, meta}, logs} = transform(content, {vars});

console.log('Meta:', meta);

fs.writeFileSync(resolve(__dirname, 'docs.en.html'), html);
