/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { app } from 'electron';
import fs from 'fs';
import path from 'path';

import packageJson from '../../package.json';
import type { Configuration, StartupApp } from '../ipc/config';
import { OFFICIAL, SourceName } from '../ipc/sources';

let config: Configuration;

export const getConfig = () => config;

export interface Argv {
    [x: string]: string;
}

const getStartupApp = (argv: Argv): StartupApp | undefined => {
    const localApp = argv['open-local-app'];
    if (localApp != null) {
        return {
            local: true,
            name: localApp,
        };
    }

    const source = argv.source || OFFICIAL;

    const downloadableApp = argv['open-downloadable-app'];
    if (downloadableApp != null) {
        return {
            local: false,
            source,
            name: downloadableApp,
        };
    }

    const officialApp = argv['open-official-app'];
    if (officialApp != null) {
        console.warn(
            'Using the command line switch --open-official-app is deprecated,\n' +
                'use --open-downloadable-app instead.'
        );

        return {
            local: false,
            source,
            name: officialApp,
        };
    }
};

/*
 * Init the config values based on the given command line arguments.
 *
 * Supported command line arguments:
 * --apps-root-dir       The directory where app data is stored.
 *                       Default: "<homeDir>/.nrfconnect-apps"
 * --user-data-dir       Path to the user data dir. If this is not
 *                       set, the environment variable NRF_USER_DATA_DIR
 *                       is also used.
 *                       See also https://www.electronjs.org/docs/api/app#appgetpathname
 *                       Default: The appData directory appended with 'nrfconnect'.
 * --settings-json-path  Path to the user's settings file.
 *                       Default: "<userDataDir>/settings.json"
 * --skip-update-apps    Do not download info/updates about apps.
 *                       Default: false
 * --skip-update-core    Skip checking for updates for nRF Connect for Desktop.
 *                       Default: false
 * --skip-splash-screen  Skip the splash screen at startup.
 *                       Default: false
 */
export const init = (argv: Argv) => {
    const appsRootDir =
        argv['apps-root-dir'] ||
        path.join(app.getPath('home'), '.nrfconnect-apps');

    config = {
        appsRootDir,
        isRunningLauncherFromSource: fs.existsSync(
            path.join(app.getAppPath(), 'README.md')
        ),
        isSkipSplashScreen: !!argv['skip-splash-screen'],
        isSkipUpdateApps: !!argv['skip-update-apps'],
        isSkipUpdateCore: !!argv['skip-update-core'],
        settingsJsonPath:
            argv['settings-json-path'] ||
            path.join(app.getPath('userData'), 'settings.json'),
        sourcesJsonPath:
            argv['sources-json-path'] ||
            path.join(appsRootDir, 'external', 'sources.json'),
        startupApp: getStartupApp(argv),
        version: packageJson.version,
    };
};

export const getAppsExternalDir = (effectiveConfig = config) =>
    path.join(effectiveConfig.appsRootDir, 'external');

export const getAppsLocalDir = () => path.join(config.appsRootDir, 'local');

export const getAppsRootDir = (
    sourceName: SourceName = OFFICIAL,
    effectiveConfig = config
) =>
    sourceName === OFFICIAL
        ? effectiveConfig.appsRootDir
        : path.join(getAppsExternalDir(effectiveConfig), sourceName);

export const getElectronResourcesDir = () =>
    path.join(app.getAppPath(), 'resources');

export const getNodeModulesDir = (sourceName?: string) =>
    path.join(getAppsRootDir(sourceName), 'node_modules');
