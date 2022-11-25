/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const { build } = require('pc-nrfconnect-shared/scripts/esbuild-renderer');

build(['./src/app', './src/launcher'], 'iife');
