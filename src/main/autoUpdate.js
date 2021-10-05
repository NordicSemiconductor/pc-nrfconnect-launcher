/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

const { autoUpdater, CancellationToken } = require('electron-updater');
const log = require('electron-log');

autoUpdater.autoDownload = false;
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

module.exports.autoUpdater = autoUpdater;
module.exports.CancellationToken = CancellationToken;
