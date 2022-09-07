/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const electronApp = require('electron').app;
const path = require('path');
const fs = require('fs');
const packageJson = require('../../package.json');
const {
    registerHandlerFromMain: registerConfigHandler,
} = require('../ipc/getConfig');

let config;
const bundledJlinkVersion = 'V7.66a';

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
 * --skip-update-core    Skip checking for updates for nRF Connect for Desktop.
 *                       Default: false
 * --skip-splash-screen  Skip the splash screen at startup.
 *                       Default: false
 *
 * @param {Object} argv command line arguments.
 * @returns {void}
 */
function init(argv) {
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
    const skipUpdateApps = argv['skip-update-apps'] || false;
    const skipUpdateCore = argv['skip-update-core'] || false;
    const skipSplashScreen = argv['skip-splash-screen'] || false;
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
        isSkipSplashScreen: skipSplashScreen,
        isSkipUpdateApps: skipUpdateApps,
        isSkipUpdateCore: skipUpdateCore,
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

function getAppsRootDir(source = 'official', effectiveConfig = config) {
    if (source === 'official') {
        return effectiveConfig.appsRootDir;
    }
    return path.join(effectiveConfig.appsExternalDir, source);
}

module.exports = {
    init,
    getVersion: () => config.version,
    getElectronRootPath: () => config.electronRootPath,
    getElectronResourcesDir: () => config.electronResourcesDir,
    getElectronExePath: () => config.electronExePath,
    getHomeDir: () => config.homeDir,
    getUserDataDir: () => config.userDataDir,
    getDesktopDir: () => config.desktopDir,
    getUbuntuDesktopDir: () => config.ubuntuDesktopDir,
    getTmpDir: () => config.tmpDir,
    getAppsRootDir,
    getAppsLocalDir: () => config.appsLocalDir,
    getAppsExternalDir: () => config.appsExternalDir,
    getNodeModulesDir: source =>
        path.join(getAppsRootDir(source), 'node_modules'),
    getUpdatesJsonPath: source =>
        path.join(getAppsRootDir(source), 'updates.json'),
    getAppsJsonPath: source => path.join(getAppsRootDir(source), 'apps.json'),
    getSettingsJsonPath: () => config.settingsJsonPath,
    getSourcesJsonPath: () => config.sourcesJsonPath,
    getAppsJsonUrl: () => config.appsJsonUrl,
    getReleaseNotesUrl: () => config.releaseNotesUrl,
    isSkipUpdateApps: () => config.skipUpdateApps,
    isSkipUpdateCore: () => config.skipUpdateCore,
    isSkipSplashScreen: () => config.skipSplashScreen,
    getOfficialAppName: () => config.officialAppName,
    getLocalAppName: () => config.localAppName,
    getSourceName: () => config.sourceName,
    isRunningLauncherFromSource: () => config.isRunningLauncherFromSource,
    bundledJlinkVersion: () => bundledJlinkVersion,
};
