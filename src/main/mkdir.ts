/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { existsSync, mkdirSync } from 'fs';

import describeError from './describeError';

// FIXME later: Fold this into fileUtil.ts as soon as this is not used from initApp.js any longer

export const mkdir = (dirPath: string) => {
    try {
        mkdirSync(dirPath, { recursive: true, mode: 0o775 });
    } catch (error) {
        throw new Error(`Unable to create ${dirPath}: ${describeError(error)}`);
    }
};

export const ensureDirExists = (dirPath: string) => {
    try {
        existsSync(dirPath);
    } catch (error) {
        if (error) {
            mkdir(dirPath);
        }
    }
};
