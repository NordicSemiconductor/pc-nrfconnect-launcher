/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createLogger, format, transports } from 'winston';

import { getUserDataPath } from './config';

const nrfConnectPath = getUserDataPath('logs');

const logFormat = format.combine(
    format.timestamp(),
    format.printf(
        ({ timestamp, level, message, ...extra }) =>
            `${timestamp} ${level.toUpperCase()} ${message} ${
                extra.length > 0 ? JSON.stringify(extra) : ''
            }`,
    ),
);

export const logger = createLogger({
    transports: [
        new transports.File({
            format: logFormat,
            dirname: nrfConnectPath,
            filename: 'main.log',
            level: 'info',
        }),
    ],
});
