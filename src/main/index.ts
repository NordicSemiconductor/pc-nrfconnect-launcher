/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// Run this as soon as possible, so it is set up for the other modules to be loaded afterwards
import './init';

import { initialize as initializeElectronRemote } from '@electron/remote/main';
import { app } from 'electron';
import { join } from 'path';

import configureElectronApp from './configureElectronApp';
import { createTextFile } from './fileUtil';
import registerIpcHandler from './registerIpcHandler';

initializeElectronRemote();
configureElectronApp();
registerIpcHandler();

/**
 * Let's store the full path to the executable if nRFConnect was started from a built package.
 * This execPath is stored in a known location, so e.g. VS Code extension can launch it even on
 * Linux where there's no standard installation location.
 */
if (app.isPackaged) {
    createTextFile(
        join(app.getPath('userData'), 'execPath'),
        process.platform === 'linux' && process.env.APPIMAGE
            ? process.env.APPIMAGE
            : process.execPath
    ).catch(err => console.log(err.message));
}
