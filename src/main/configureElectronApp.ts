/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { app, dialog, Menu } from 'electron';
import { copyFileSync, existsSync } from 'fs';

import { isInstalled } from '../ipc/apps';
import {
    getQuickstartAlreadyLaunched,
    setQuickstartAlreadyLaunched,
} from '../ipc/persistedStore';
import { readAppInfoFile } from './apps/app';
import {
    installAllLocalAppArchives,
    installDownloadableAppCore,
} from './apps/appChanges';
import { getDownloadableApps } from './apps/apps';
import {
    addToSourceList,
    getSource,
    initialiseAllSources,
    writeSourceJson,
} from './apps/sources';
import {
    getAppsExternalDir,
    getAppsLocalDir,
    getAppsRootDir,
    getConfig,
    getElectronResourcesDir,
    getNodeModulesDir,
} from './config';
import describeError from './describeError';
import loadDevtools from './devtools';
import { readJsonFile } from './fileUtil';
import { logger } from './log';
import menu from './menu';
import { ensureDirExists } from './mkdir';
import {
    openAppWindow,
    openDownloadableAppWindow,
    openLauncherWindow,
    openLocalAppWindow,
} from './windows';

const ensureInternalSourceExists = () => {
    if (
        getSource('Internal') == null &&
        existsSync(`${getElectronResourcesDir()}/prefetched/source.json`)
    ) {
        const internalSource = {
            name: 'Internal',
            url: 'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/internal/source.json',
        };
        addToSourceList(internalSource);
        ensureDirExists(getAppsRootDir(internalSource.name));

        writeSourceJson(
            internalSource,
            readJsonFile(`${getElectronResourcesDir()}/prefetched/source.json`)
        );
    }

    [
        'pc-nrfconnect-boilerplate.json',
        'pc-nrfconnect-cellularmonitor.json',
        'pc-nrfconnect-dtm.json',
        'pc-nrfconnect-linkmonitor.json',
        'pc-nrfconnect-npm.json',
        'pc-nrfconnect-ppk.json',
        'pc-nrfconnect-programmer.json',
        'pc-nrfconnect-quickstart.json',
        'pc-nrfconnect-serial-terminal.json',
        'pc-nrfconnect-toolchain-manager.json',
    ].forEach(file => {
        const from = `${getElectronResourcesDir()}/prefetched/${file}`;
        const to = `${getAppsRootDir('Internal')}/${file}`;
        if (existsSync(from) && !existsSync(to)) {
            copyFileSync(from, to);
        }
    });
};

const ensureQuickstartAppExists = async () => {
    const quickstartAppPackage = `${getElectronResourcesDir()}/prefetched/pc-nrfconnect-quickstart-0.0.1.tgz`;
    const quickstartAppNotInstalled = !isInstalled(getQuickstartApp());
    if (quickstartAppNotInstalled && existsSync(quickstartAppPackage)) {
        const appSpec = {
            name: 'pc-nrfconnect-quickstart',
            source: 'Internal',
        };
        const { shasum } = readAppInfoFile(appSpec).versions['0.0.1'];
        await installDownloadableAppCore(
            appSpec,
            quickstartAppPackage,
            shasum,
            false
        );
    }
};

const getQuickstartApp = () =>
    getDownloadableApps().apps.find(
        ({ name, source }) =>
            name === 'pc-nrfconnect-quickstart' && source === 'Internal'
    );

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

const openQuickstart = () => {
    const quickstartApp = getQuickstartApp();
    const shouldOpenQuickstart =
        !getQuickstartAlreadyLaunched() && isInstalled(quickstartApp);

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
