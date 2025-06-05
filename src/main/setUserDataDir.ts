/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { app } from 'electron';
import fs from 'fs';

import argv from './argv';

declare global {
    var userDataDir: string; // eslint-disable-line no-var, vars-on-top -- Because this seems to be the way to declare a global variable in TypeScript
}

const userDataDir = argv['user-data-dir'] ?? process.env.NRF_USER_DATA_DIR;

if (userDataDir != null) {
    fs.mkdirSync(userDataDir, { recursive: true });
    app.setPath('userData', userDataDir);
}

// Must be set because it is expected in global.userDataDir at shared/src/utils/appDirs.ts until shared@122
global.userDataDir = app.getPath('userData');
