/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { app } from 'electron';
import { ensureDirSync } from 'fs-extra';
import { argv } from 'yargs';

import { Argv } from './config';

const userDataDir =
    (argv as Argv)['user-data-dir'] || process.env.NRF_USER_DATA_DIR;

if (userDataDir != null) {
    ensureDirSync(userDataDir);
    app.setPath('userData', userDataDir);
}
