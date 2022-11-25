/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
const { sassPlugin } = require('esbuild-sass-plugin');
const esbuild = require('esbuild');

esbuild.build({
    entryPoints: ['./resources/css/bootstrap.scss'],
    outfile: './dist/bootstrap.css',
    target: 'chrome89',
    sourcemap: false,
    metafile: false,
    watch: false,
    loader: {
        '.eot': 'file',
        '.ttf': 'file',
        '.woff': 'file',
        '.woff2': 'file',

        '.gif': 'file',
        '.svg': 'file',
        '.png': 'file',
    },
    bundle: true,
    write: true,
    plugins: [
        sassPlugin({
            cssImports: true,
            quietDeps: false,
        }),
    ],
});
