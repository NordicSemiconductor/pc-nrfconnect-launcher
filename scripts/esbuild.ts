#!/usr/bin/env ts-node

/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import esbuild, { BuildOptions } from 'esbuild';

import { dependencies } from '../package.json';

const options = {
    bundle: true,
    color: true,
    entryPoints: ['src/main/index.ts'],
    external: ['electron', ...Object.keys(dependencies ?? {})],
    logLevel: 'info',
    outfile: 'dist/main.js',
    platform: 'node',
    sourcemap: true,
    define: {
        'process.env.NODE_ENV': `"${
            process.argv.includes('--prod') ? 'production' : 'development'
        }"`,
    },
    minify: process.argv.includes('--prod'),
} satisfies BuildOptions;

const build = async () => {
    if (process.argv.includes('--watch')) {
        const context = await esbuild.context(options);

        await context.rebuild();
        await context.watch();
    } else {
        esbuild.build(options);
    }
};

build();
