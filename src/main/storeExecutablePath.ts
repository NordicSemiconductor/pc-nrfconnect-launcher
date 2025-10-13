/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { app } from 'electron';

import { getUserDataPath } from './config';
import describeError from './describeError';
import { writeFile } from './fileUtil';

/*
 * Let's store the full path to the executable if nRFConnect was started from a built package.
 * This execPath is stored in a known location, so e.g. VS Code extension can launch it even on
 * Linux where there's no standard installation location.
 */
export default () => {
    if (app.isPackaged) {
        try {
            writeFile(
                getUserDataPath('execPath'),
                process.platform === 'linux' && process.env.APPIMAGE
                    ? process.env.APPIMAGE
                    : process.execPath,
            );
        } catch (error) {
            console.log(describeError(error));
        }
    }
};
