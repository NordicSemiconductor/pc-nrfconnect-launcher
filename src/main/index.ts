/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// Run this as soon as possible, so it is set up for the other modules to be loaded afterwards
import './init';

import { initialize as initializeElectronRemote } from '@electron/remote/main';
import { app as electronApp, dialog, ipcMain, Menu } from 'electron';
import { join } from 'path';

import { registerHandlerFromMain as registerAppDetailsHandler } from '../ipc/appDetails';
import {
    registerDownloadAllAppsJsonFilesHandlerFromMain as registerDownloadAllAppsJsonFilesHandler,
    registerDownloadReleaseNotesHandlerFromMain as registerDownloadReleaseNotesHandler,
    registerGetDownloadableAppsHandlerFromMain as registerGetDownloadableAppsHandler,
    registerGetLocalAppsHandlerFromMain as registerGetLocalAppsHandler,
    registerInstallDownloadableAppHandlerFromMain as registerInstallDownloadableAppHandler,
    registerRemoveDownloadableAppHandlerFromMain as registerRemoveDownloadableAppHandler,
} from '../ipc/apps';
import { registerHandlerFromMain as registerCreateDesktopShortcutHandler } from '../ipc/createDesktopShortcut';
import { registerHandlerFromMain as registerDownloadToFileHandler } from '../ipc/downloadToFile';
import {
    registerCancelUpdateHandlerFromMain as registerCancelUpdateHandler,
    registerCheckForUpdateHandlerFromMain as registerCheckForUpdateHandler,
    registerStartUpdateHandlerFromMain as registerStartUpdateHandler,
} from '../ipc/launcherUpdate';
import {
    registerEndHandlerFromMain as registerEndPreventSleepHandler,
    registerStartHandlerFromMain as registerStartPreventSleepHandler,
} from '../ipc/preventSleep';
import { registerHandlerFromMain as registerProxyLoginCredentialsHandler } from '../ipc/proxyLogin';
import {
    registerGetHandlerFromMain as registerGetSettingHandler,
    registerSetHandlerFromMain as registerSetSettingHandler,
} from '../ipc/settings';
import {
    registerAddHandlerFromMain as registerAddSourceHandler,
    registerGetHandlerFromMain as registerGetSourcesHandler,
    registerRemoveHandlerFromMain as registerRemoveSourceHandler,
} from '../ipc/sources';
import * as apps from './apps';
import { cancelUpdate, checkForUpdate, startUpdate } from './autoUpdate';
import * as config from './config';
import createDesktopShortcut from './createDesktopShortcut';
import describeError from './describeError';
import loadDevtools from './devtools';
import { createTextFile } from './fileUtil';
import { logger } from './log';
import { createMenu } from './menu';
import { downloadToFile } from './net';
import { callRegisteredCallback } from './proxyLogins';
import * as settings from './settings';
import * as sources from './sources';
import * as windows from './windows';

initializeElectronRemote();

const applicationMenu = Menu.buildFromTemplate(createMenu(electronApp));

electronApp.allowRendererProcessReuse = false;

electronApp.on('ready', async () => {
    await loadDevtools();

    Menu.setApplicationMenu(applicationMenu);

    try {
        await apps.initAppsDirectory();

        const downloadableAppToLaunch = config.getOfficialAppName();
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

electronApp.on('render-process-gone', (event, wc, details) => {
    wc.getTitle();
    logger.error(`Renderer crashed ${wc.getTitle()}`, details);
});

electronApp.on('child-process-gone', (event, details) => {
    logger.error(`Child process crashed `, details);
});

electronApp.on('window-all-closed', () => {
    electronApp.quit();
});

ipcMain.on('open-app-launcher', () => {
    windows.openLauncherWindow();
});

ipcMain.on('open-app', (event, app) => {
    windows.openAppWindow(app);
});

registerAppDetailsHandler(windows.getAppDetails);

registerDownloadToFileHandler(downloadToFile);
registerCreateDesktopShortcutHandler(createDesktopShortcut);

registerGetSettingHandler(settings.get);
registerSetSettingHandler(settings.set);

registerEndPreventSleepHandler();
registerStartPreventSleepHandler();

registerProxyLoginCredentialsHandler(callRegisteredCallback);

registerCheckForUpdateHandler(checkForUpdate);
registerStartUpdateHandler(startUpdate);
registerCancelUpdateHandler(cancelUpdate);

registerDownloadAllAppsJsonFilesHandler(apps.downloadAllAppsJsonFiles);
registerGetLocalAppsHandler(apps.getLocalApps);
registerGetDownloadableAppsHandler(apps.getDownloadableApps);
registerDownloadReleaseNotesHandler(apps.downloadReleaseNotes);
registerInstallDownloadableAppHandler(apps.installDownloadableApp);
registerRemoveDownloadableAppHandler(apps.removeDownloadableApp);

registerGetSourcesHandler(sources.getAllSources);
registerAddSourceHandler(sources.addSource);
registerRemoveSourceHandler(sources.removeSource);

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
