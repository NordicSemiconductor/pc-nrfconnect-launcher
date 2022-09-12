/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { app } from 'electron';
import fs from 'fs';
import path from 'path';

import packageJson from '../../package.json';
import { Configuration, registerGetConfig, StartupApp } from '../ipc/getConfig';
import bundledJlinkVersion from './bundledJlinkVersion';

let config: Configuration;

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

    const sourceName = argv.source || 'official';

    const downloadableApp = argv['open-downloadable-app'];
    if (downloadableApp != null) {
        return {
            local: false,
            sourceName,
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
            sourceName,
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
export function init(argv: Argv) {
    const appsRootDir =
        argv['apps-root-dir'] ||
        path.join(app.getPath('home'), '.nrfconnect-apps');

    config = {
        appsExternalDir: path.join(appsRootDir, 'external'),
        appsJsonUrl:
            'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/apps.json',
        appsLocalDir: path.join(appsRootDir, 'local'),
        appsRootDir,
        bundledJlinkVersion,
        desktopDir: app.getPath('desktop'),
        electronExePath: process.env.APPIMAGE || app.getPath('exe'),
        electronResourcesDir: path.join(app.getAppPath(), 'resources'),
        electronRootPath: app.getAppPath(),
        homeDir: app.getPath('home'),
        isRunningLauncherFromSource: fs.existsSync(
            path.join(app.getAppPath(), 'README.md')
        ),
        isSkipSplashScreen: !!argv['skip-splash-screen'],
        isSkipUpdateApps: !!argv['skip-update-apps'],
        isSkipUpdateCore: !!argv['skip-update-core'],
        releaseNotesUrl:
            'https://github.com/NordicSemiconductor/pc-nrfconnect-launcher/releases',
        settingsJsonPath:
            argv['settings-json-path'] ||
            path.join(app.getPath('userData'), 'settings.json'),
        sourcesJsonPath:
            argv['sources-json-path'] ||
            path.join(appsRootDir, 'external', 'sources.json'),
        startupApp: getStartupApp(argv),
        tmpDir: app.getPath('temp'),
        ubuntuDesktopDir: path.join(
            app.getPath('home'),
            '.local',
            'share',
            'applications'
        ),
        userDataDir: app.getPath('userData'),
        version: packageJson.version,
    };

    registerGetConfig(config);
}

export function getAppsRootDir(
    sourceName = 'official',
    effectiveConfig = config
) {
    if (sourceName === 'official') {
        return effectiveConfig.appsRootDir;
    }
    return path.join(effectiveConfig.appsExternalDir, sourceName);
}

export const getNodeModulesDir = (sourceName?: string) =>
    path.join(getAppsRootDir(sourceName), 'node_modules');

export const getUpdatesJsonPath = (sourceName?: string) =>
    path.join(getAppsRootDir(sourceName), 'updates.json');

export const getAppsJsonPath = (sourceName?: string) =>
    path.join(getAppsRootDir(sourceName), 'apps.json');

export const getConfig = () => config;
