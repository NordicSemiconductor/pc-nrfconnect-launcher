/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { app as electronApp } from 'electron';
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
    const { version: pkgVer } = packageJson;
    const version = pkgVer;
    const electronRootPath = electronApp.getAppPath();
    const electronResourcesDir = path.join(electronRootPath, 'resources');
    const electronExePath = process.env.APPIMAGE || electronApp.getPath('exe');
    const homeDir = electronApp.getPath('home');
    const userDataDir = electronApp.getPath('userData');
    const desktopDir = electronApp.getPath('desktop');
    const ubuntuDesktopDir = path.join(
        homeDir,
        '.local',
        'share',
        'applications'
    );
    const tmpDir = electronApp.getPath('temp');
    const appsRootDir =
        argv['apps-root-dir'] || path.join(homeDir, '.nrfconnect-apps');
    const appsLocalDir = path.join(appsRootDir, 'local');
    const appsExternalDir = path.join(appsRootDir, 'external');
    const settingsJsonPath =
        argv['settings-json-path'] || path.join(userDataDir, 'settings.json');
    const sourcesJsonPath =
        argv['sources-json-path'] || path.join(appsExternalDir, 'sources.json');
    const appsJsonUrl =
        'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/apps.json';
    const releaseNotesUrl =
        'https://github.com/NordicSemiconductor/pc-nrfconnect-launcher/releases';
    const isSkipUpdateApps = !!argv['skip-update-apps'] || false;
    const isSkipUpdateCore = !!argv['skip-update-core'] || false;
    const isSkipSplashScreen = !!argv['skip-splash-screen'] || false;
    const startupApp = getStartupApp(argv);
    const isRunningLauncherFromSource = fs.existsSync(
        path.join(electronRootPath, 'README.md')
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Must be set because it is expected in global.userDataDir at shared/src/utils/appDirs.ts
    (<any>global).userDataDir = userDataDir;

    config = {
        appsExternalDir,
        appsJsonUrl,
        appsLocalDir,
        appsRootDir,
        bundledJlinkVersion,
        desktopDir,
        electronExePath,
        electronResourcesDir,
        electronRootPath,
        homeDir,
        isRunningLauncherFromSource,
        isSkipSplashScreen,
        isSkipUpdateApps,
        isSkipUpdateCore,
        releaseNotesUrl,
        settingsJsonPath,
        sourcesJsonPath,
        startupApp,
        tmpDir,
        ubuntuDesktopDir,
        userDataDir,
        version,
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
