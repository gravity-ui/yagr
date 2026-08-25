// Builds the AI-facing docs tree (cleaned README + docs/en guides) into dist/docs so an
// agent in a consumer project reads docs matching the installed version from
// node_modules/@gravity-ui/yagr/dist/docs. Appended to the build npm script.
// yagr keeps its source docs under docs/en/ (YFM layout), so that is the guides baseDir.
// Uses @gravity-ui/readme-validator's buildDocs().
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {buildDocs} from '@gravity-ui/readme-validator';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

buildDocs({
    rootDir: ROOT,
    outDir: path.join(ROOT, 'dist', 'docs'),
    sources: [
        {
            title: 'Guides',
            kind: 'markdown',
            baseDir: 'docs/en',
            outPrefix: 'guides',
            nameFromTitle: true,
        },
    ],
});
