/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

const electronApp = require('electron').app;
const path = require('path');
const fs = require('fs');
const packageJson = require('../../package.json');

let version;
let electronRootPath;
let electronResourcesDir;
let electronExePath;
let homeDir;
let userDataDir;
let desktopDir;
let ubuntuDesktopDir;
let tmpDir;
let appsRootDir;
let appsLocalDir;
let appsExternalDir;
let appsJsonUrl;
let settingsJsonPath;
let sourcesJsonPath;
let registryUrl;
let releaseNotesUrl;
let skipUpdateApps;
let skipUpdateCore;
let skipSplashScreen;
let officialAppName;
let localAppName;
let sourceName;
let isRunningLauncherFromSource;

/**
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
 * --skip-update-core    Skip checking for updates for nRF Connect.
 *                       Default: false
 * --skip-splash-screen  Skip the splash screen at startup.
 *                       Default: false
 *
 * @param {Object} argv command line arguments.
 * @returns {void}
 */
function init(argv) {
    const { version: pkgVer } = packageJson;
    version = pkgVer;
    electronRootPath = electronApp.getAppPath();
    electronResourcesDir = path.join(electronRootPath, 'resources');
    electronExePath = process.env.APPIMAGE || electronApp.getPath('exe');
    homeDir = electronApp.getPath('home');
    userDataDir = electronApp.getPath('userData');
    desktopDir = electronApp.getPath('desktop');
    ubuntuDesktopDir = path.join(homeDir, '.local', 'share', 'applications');
    tmpDir = electronApp.getPath('temp');
    appsRootDir =
        argv['apps-root-dir'] || path.join(homeDir, '.nrfconnect-apps');
    appsLocalDir = path.join(appsRootDir, 'local');
    appsExternalDir = path.join(appsRootDir, 'external');
    settingsJsonPath =
        argv['settings-json-path'] || path.join(userDataDir, 'settings.json');
    sourcesJsonPath =
        argv['sources-json-path'] || path.join(appsExternalDir, 'sources.json');
    appsJsonUrl =
        'https://raw.githubusercontent.com/NordicSemiconductor/pc-nrfconnect-launcher/master/apps.json';
    registryUrl = 'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/';
    releaseNotesUrl =
        'https://github.com/NordicSemiconductor/pc-nrfconnect-launcher/releases';
    skipUpdateApps = argv['skip-update-apps'] || false;
    skipUpdateCore = argv['skip-update-core'] || false;
    skipSplashScreen = argv['skip-splash-screen'] || false;
    officialAppName = argv['open-official-app'] || null;
    localAppName = argv['open-local-app'] || null;
    sourceName = argv.source || 'official';
    isRunningLauncherFromSource = fs.existsSync(
        path.join(electronRootPath, 'README.md')
    );
}

function getAppsRootDir(source = 'official') {
    if (source === 'official') {
        return appsRootDir;
    }
    return path.join(appsExternalDir, source);
}

module.exports = {
    init,
    getVersion: () => version,
    getElectronRootPath: () => electronRootPath,
    getElectronResourcesDir: () => electronResourcesDir,
    getElectronExePath: () => electronExePath,
    getHomeDir: () => homeDir,
    getUserDataDir: () => userDataDir,
    getDesktopDir: () => desktopDir,
    getUbuntuDesktopDir: () => ubuntuDesktopDir,
    getTmpDir: () => tmpDir,
    getAppsRootDir,
    getAppsLocalDir: () => appsLocalDir,
    getAppsExternalDir: () => appsExternalDir,
    getNodeModulesDir: source =>
        path.join(getAppsRootDir(source), 'node_modules'),
    getUpdatesJsonPath: source =>
        path.join(getAppsRootDir(source), 'updates.json'),
    getAppsJsonPath: source => path.join(getAppsRootDir(source), 'apps.json'),
    getSettingsJsonPath: () => settingsJsonPath,
    getSourcesJsonPath: () => sourcesJsonPath,
    getAppsJsonUrl: () => appsJsonUrl,
    getRegistryUrl: () => registryUrl,
    getReleaseNotesUrl: () => releaseNotesUrl,
    isSkipUpdateApps: () => skipUpdateApps,
    isSkipUpdateCore: () => skipUpdateCore,
    isSkipSplashScreen: () => skipSplashScreen,
    getOfficialAppName: () => officialAppName,
    getLocalAppName: () => localAppName,
    getSourceName: () => sourceName,
    isRunningLauncherFromSource: () => isRunningLauncherFromSource,
};
