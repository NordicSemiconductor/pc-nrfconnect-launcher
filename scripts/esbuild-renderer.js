/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// Copying this from shared for now to avoid creating a shared release to remove react as an external for now.
const { build } = require('./esbuild-rendere-from-shared');

build({
    entryPoints: ['./src/launcher'],
    outfile: './dist/launcher.js',
    format: 'cjs',
    external: [],
});
build({
    entryPoints: ['./src/app'],
    outfile: './dist/app.js',
    format: 'iife',
    external: [
        'react',
        'react-dom',
    ],
});
