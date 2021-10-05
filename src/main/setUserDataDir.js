/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

const { argv } = require('yargs');
const { ensureDirSync } = require('fs-extra');
const { app } = require('electron');

const userDataDir = argv['user-data-dir'] || process.env.NRF_USER_DATA_DIR;

if (userDataDir != null) {
    ensureDirSync(userDataDir);
    app.setPath('userData', userDataDir);
}
