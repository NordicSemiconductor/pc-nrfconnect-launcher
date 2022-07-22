/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { app as electronApp } from 'electron';
import fs from 'fs';
import path from 'path';

import packageJson from '../../package.json';
import {
    Configuration,
    registerHandlerFromMain as registerConfigHandler,
} from '../ipc/getConfig';
import bundledJlinkVersion from './bundledJlinkVersion';

let config: Configuration;

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
export function init(argv: { [x: string]: string }) {
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
    const officialAppName = argv['open-official-app'] || null;
    const localAppName = argv['open-local-app'] || null;
    const sourceName = argv.source || 'official';
    const isRunningLauncherFromSource = fs.existsSync(
        path.join(electronRootPath, 'README.md')
    );

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
        localAppName,
        officialAppName,
        releaseNotesUrl,
        settingsJsonPath,
        sourceName,
        sourcesJsonPath,
        tmpDir,
        ubuntuDesktopDir,
        userDataDir,
        version,
    };

    registerConfigHandler(config);
}

export function getAppsRootDir(source = 'official', effectiveConfig = config) {
    if (source === 'official') {
        return effectiveConfig.appsRootDir;
    }
    return path.join(effectiveConfig.appsExternalDir, source);
}

export const getVersion = () => config.version;
export const getElectronRootPath = () => config.electronRootPath;
export const getElectronResourcesDir = () => config.electronResourcesDir;
export const getElectronExePath = () => config.electronExePath;
export const getHomeDir = () => config.homeDir;
export const getUserDataDir = () => config.userDataDir;
export const getDesktopDir = () => config.desktopDir;
export const getUbuntuDesktopDir = () => config.ubuntuDesktopDir;
export const getTmpDir = () => config.tmpDir;
export const getAppsLocalDir = () => config.appsLocalDir;
export const getAppsExternalDir = () => config.appsExternalDir;
export const getNodeModulesDir = (source: string) =>
    path.join(getAppsRootDir(source), 'node_modules');
export const getUpdatesJsonPath = (source: string) =>
    path.join(getAppsRootDir(source), 'updates.json');
export const getAppsJsonPath = (source: string) =>
    path.join(getAppsRootDir(source), 'apps.json');
export const getSettingsJsonPath = () => config.settingsJsonPath;
export const getSourcesJsonPath = () => config.sourcesJsonPath;
export const getAppsJsonUrl = () => config.appsJsonUrl;
export const getReleaseNotesUrl = () => config.releaseNotesUrl;
export const isSkipUpdateApps = () => config.isSkipUpdateApps;
export const isSkipUpdateCore = () => config.isSkipUpdateCore;
export const isSkipSplashScreen = () => config.isSkipSplashScreen;
export const getOfficialAppName = () => config.officialAppName;
export const getLocalAppName = () => config.localAppName;
export const getSourceName = () => config.sourceName;
export const isRunningLauncherFromSource = () =>
    config.isRunningLauncherFromSource;
export const getBundledJlinkVersion = () => config.bundledJlinkVersion;
