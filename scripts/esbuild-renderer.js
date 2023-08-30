/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// Copying this from shared for now to avoid creating a shared release to remove react as an external for now.
const {
    build,
} = require('@nordicsemiconductor/pc-nrfconnect-shared/scripts/esbuild-renderer');
const builtinModules = require('module').builtinModules;

const { dependencies } = JSON.parse(
    require('fs').readFileSync('package.json', 'utf8')
);

const commonExternal = [
    ...builtinModules,

    // launcher includes
    'electron',
    'serialport',
    '@electron/remote',

    // App dependencies
    ...Object.keys(dependencies ?? {}),
];

build({
    entryPoints: ['./resources/css/fonts.scss'],
    outfile: './dist/fonts.css',
    sourcemap: false,
});

build({
    entryPoints: ['./src/launcher'],
    outfile: './dist/launcher.js',
    format: 'cjs',
    external: [...commonExternal],
});

build({
    entryPoints: ['./src/app'],
    outfile: './dist/app.js',
    format: 'cjs',
    external: [...commonExternal, 'react', 'react-dom'],
});
