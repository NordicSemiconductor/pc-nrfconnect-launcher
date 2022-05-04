/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const { createLogger, transports } = require('winston');
const path = require('path');
const { autoUpdater, CancellationToken } = require('electron-updater');

const config = require('./config');

const nrfConnectPath = path.join(config.getUserDataDir(), 'logs');
const logger = createLogger({
    transports: [
        new transports.File({
            dirname: nrfConnectPath,
            filename: 'autoUpdate.log',
            level: 'info',
        }),
    ],
});

autoUpdater.autoDownload = false;
autoUpdater.logger = logger;

module.exports.autoUpdater = autoUpdater;
module.exports.CancellationToken = CancellationToken;
