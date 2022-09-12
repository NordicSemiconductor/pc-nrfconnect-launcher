/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { app } from 'electron';
import { ensureDirSync } from 'fs-extra';
import { argv } from 'yargs';

import { Argv } from './config';

declare global {
    var userDataDir: string; // eslint-disable-line no-var, vars-on-top -- Because this seems to be the way to declare a global variable in TypeScript
}

const userDataDir =
    (argv as Argv)['user-data-dir'] || process.env.NRF_USER_DATA_DIR;

if (userDataDir != null) {
    ensureDirSync(userDataDir);
    app.setPath('userData', userDataDir);
}

// Must be set because it is expected in global.userDataDir at shared/src/utils/appDirs.ts
global.userDataDir = app.getPath('userData');
