/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { app, dialog, Menu } from 'electron';

import {
    getQuickstartAlreadyLaunched,
    setQuickstartAlreadyLaunched,
} from '../ipc/persistedStore';
import { installAllLocalAppArchives } from './apps/appChanges';
import { getLocalApps } from './apps/apps';
import { initialiseAllSources } from './apps/sources';
import {
    getAppsExternalDir,
    getAppsLocalDir,
    getAppsRootDir,
    getConfig,
    getNodeModulesDir,
} from './config';
import describeError from './describeError';
import loadDevtools from './devtools';
import { logger } from './log';
import menu from './menu';
import { ensureDirExists } from './mkdir';
import {
    openAppWindow,
    openDownloadableAppWindow,
    openLauncherWindow,
    openLocalAppWindow,
} from './windows';

const initAppsDirectory = async () => {
    ensureDirExists(getAppsRootDir());
    ensureDirExists(getAppsLocalDir());
    ensureDirExists(getAppsExternalDir());
    ensureDirExists(getNodeModulesDir());
    initialiseAllSources();
    await installAllLocalAppArchives();
};

const openQuickstart = () => {
    const quickstartApp = getLocalApps(false).find(
        localApp => localApp.name === 'pc-nrfconnect-quickstart'
    );
    const shouldOpenQuickstart =
        !process.argv.includes('--force-launcher') &&
        !getQuickstartAlreadyLaunched() &&
        quickstartApp != null;

    if (shouldOpenQuickstart) {
        setQuickstartAlreadyLaunched(true);
        openAppWindow(quickstartApp);
        return true;
    }

    return false;
};

const openInitialWindow = () => {
    const { startupApp } = getConfig();

    if (startupApp == null) {
        openQuickstart() || openLauncherWindow();

        return;
    }

    if (startupApp.local) {
        openLocalAppWindow(startupApp.name);
    } else {
        openDownloadableAppWindow(startupApp);
    }
};

const fatalError = (error: unknown) => {
    dialog.showMessageBoxSync({
        type: 'error',
        title: 'Initialization error',
        message: 'Error when starting application',
        detail: describeError(error),
        buttons: ['OK'],
    });

    app.quit();
};

export default () => {
    app.on('ready', async () => {
        await loadDevtools();

        Menu.setApplicationMenu(menu());

        try {
            await initAppsDirectory();
            openInitialWindow();
        } catch (error) {
            fatalError(error);
        }
    });

    app.on('render-process-gone', (_event, wc, details) => {
        wc.getTitle();
        logger.error(`Renderer crashed ${wc.getTitle()}`, details);
    });

    app.on('child-process-gone', (_event, details) => {
        logger.error(`Child process crashed `, details);
    });

    app.on('window-all-closed', () => {
        app.quit();
    });
};
