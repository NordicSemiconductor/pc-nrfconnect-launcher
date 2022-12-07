/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

require('esbuild')
    .build({
        bundle: true,
        color: true,
        entryPoints: ['src/main/index.ts'],
        external: ['electron', /node_modules\/(?!pc-nrfconnect-shared\/)/],
        logLevel: 'info',
        outfile: 'dist/main.js',
        platform: 'node',
        sourcemap: true,
        watch: process.argv.includes('--watch'),
        minify: process.argv.includes('--prod'),
    })
    .catch(() => process.exit(1));
