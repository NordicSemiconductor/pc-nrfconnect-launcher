/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// Run this as soon as possible, so it is set up for the other modules to be loaded afterwards
import './init';

import { initialize as initializeElectronRemote } from '@electron/remote/main';
import { app as electronApp, dialog, Menu } from 'electron';
import { join } from 'path';

import * as apps from './apps';
import * as config from './config';
import describeError from './describeError';
import loadDevtools from './devtools';
import { createTextFile } from './fileUtil';
import { logger } from './log';
import { createMenu } from './menu';
import registerIpcHandler from './registerIpcHandler';
import * as windows from './windows';

initializeElectronRemote();

const applicationMenu = Menu.buildFromTemplate(createMenu(electronApp));

electronApp.allowRendererProcessReuse = false;

electronApp.on('ready', async () => {
    await loadDevtools();

    Menu.setApplicationMenu(applicationMenu);

    try {
        await apps.initAppsDirectory();

        const downloadableAppToLaunch = config.getDownloadableAppName();
        const localAppToLaunch = config.getLocalAppName();
        if (downloadableAppToLaunch) {
            await windows.openOfficialAppWindow(
                downloadableAppToLaunch,
                config.getSourceName()
            );
        } else if (localAppToLaunch) {
            await windows.openLocalAppWindow(localAppToLaunch);
        } else {
            windows.openLauncherWindow();
        }
    } catch (error) {
        await dialog.showMessageBox({
            type: 'error',
            title: 'Initialization error',
            message: 'Error when starting application',
            detail: describeError(error),
            buttons: ['OK'],
        });
        electronApp.quit();
    }
});

electronApp.on('render-process-gone', (_event, wc, details) => {
    wc.getTitle();
    logger.error(`Renderer crashed ${wc.getTitle()}`, details);
});

electronApp.on('child-process-gone', (_event, details) => {
    logger.error(`Child process crashed `, details);
});

electronApp.on('window-all-closed', () => {
    electronApp.quit();
});

registerIpcHandler();

/**
 * Let's store the full path to the executable if nRFConnect was started from a built package.
 * This execPath is stored in a known location, so e.g. VS Code extension can launch it even on
 * Linux where there's no standard installation location.
 */
if (electronApp.isPackaged) {
    createTextFile(
        join(config.getUserDataDir(), 'execPath'),
        process.platform === 'linux' && process.env.APPIMAGE
            ? process.env.APPIMAGE
            : process.execPath
    ).catch(err => console.log(err.message));
}
