/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const {
    build,
} = require('@nordicsemiconductor/pc-nrfconnect-shared/scripts/esbuild-renderer');

build({
    entryPoints: ['./resources/css/fonts.scss'],
    outfile: './dist/fonts.css',
    sourcemap: false,
});

build({ entryPoints: ['./src/app', './src/launcher'], format: 'iife' });
