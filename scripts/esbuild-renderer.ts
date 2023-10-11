#!/usr/bin/env ts-node

/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { build } from '@nordicsemiconductor/pc-nrfconnect-shared/scripts/esbuild-renderer';

build({
    entryPoints: ['./resources/css/fonts.scss'],
    outfile: './dist/fonts.css',
    sourcemap: false,
});

build({
    entryPoints: ['./src/launcher'],
    outfile: './dist/launcher.js',
});

build(
    {
        entryPoints: ['./src/app'],
        outfile: './dist/app.js',
    },
    { externalReact: true } // Needed to run older apps (e.g. RSSI@1.4.5) which do not yet bundle their version of React.
);
