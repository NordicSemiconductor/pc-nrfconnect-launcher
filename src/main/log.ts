/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import path from 'path';
import { createLogger, format, transports } from 'winston';

import * as config from './config';

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
