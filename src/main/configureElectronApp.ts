/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { app, dialog, Menu } from 'electron';
import fs from 'fs';
import path from 'path';

import { installAllLocalAppArchives } from './apps/appChanges';
import { ensureQuickstartAppExists } from './apps/quickstart';
import {
    ensureInternalSourceExists,
    initialiseAllSources,
} from './apps/sources';
import argv, { getStartupApp } from './argv';
import {
    getAppsExternalDir,
    getAppsLocalDir,
    getAppsRootDir,
    getBundledResourcesDir,
    getNodeModulesDir,
    getUserDataDir,
} from './config';
import describeError from './describeError';
import loadDevtools from './devtools';
import { logger } from './log';
import menu from './menu';
import { ensureDirExists } from './mkdir';
import {
    openDownloadableAppWindow,
    openLauncherWindow,
    openLocalAppWindow,
} from './windows';

const initAppsDirectory = async () => {
    ensureDirExists(getAppsRootDir());
    ensureDirExists(getAppsLocalDir());
    ensureDirExists(getAppsExternalDir());
    ensureDirExists(getNodeModulesDir());
    ensureInternalSourceExists();
    initialiseAllSources();
    await ensureQuickstartAppExists();
    await installAllLocalAppArchives();
};

export const openInitialWindow = (args = argv) => {
    const startupApp = getStartupApp(args);

    if (startupApp == null) {
        openLauncherWindow();
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

const initNrfutil = () => {
    const binName = `nrfutil${process.platform === 'win32' ? '.exe' : ''}`;

    const nrfutilBundled = path.join(getBundledResourcesDir(), binName);
    const nrfutilInAppPath = path.join(getUserDataDir(), binName);

    if (!fs.existsSync(nrfutilInAppPath)) {
        fs.copyFileSync(nrfutilBundled, nrfutilInAppPath);
    }
};

export default () => {
    app.on('ready', async () => {
        await loadDevtools();

        Menu.setApplicationMenu(menu());

        try {
            await initAppsDirectory();
            initNrfutil();
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
