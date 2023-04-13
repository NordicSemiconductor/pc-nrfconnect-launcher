/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const esbuild = require('esbuild');
const fs = require('node:fs');

const { dependencies } = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const options = {
    bundle: true,
    color: true,
    entryPoints: ['src/main/index.ts'],
    external: ['electron', ...Object.keys(dependencies ?? {})],
    logLevel: 'info',
    outfile: 'dist/main.js',
    platform: 'node',
    sourcemap: true,
    minify: process.argv.includes('--prod'),
};

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
