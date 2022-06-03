/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const { createLogger, transports, format } = require('winston');
const path = require('path');
const config = require('./config');

const nrfConnectPath = path.join(config.getUserDataDir(), 'logs');

const logFormat = format.combine(
    format.timestamp(),
    format.printf(
        ({ timestamp, level, message, ...extra }) =>
            `${timestamp} ${level.toUpperCase()} ${message} ${JSON.stringify(
                extra
            )}`
    )
);

const logger = createLogger({
    transports: [
        new transports.File({
            format: logFormat,
            dirname: nrfConnectPath,
            filename: 'main.log',
            level: 'info',
        }),
    ],
});

module.exports = { logger };
