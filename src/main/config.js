/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

const electronApp = require('electron').app;
const path = require('path');
const packageJson = require('../../package.json');

let version;
let electronRootPath;
let electronResourcesDir;
let electronExePath;
let homeDir;
let userDataDir;
let desktopDir;
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

/**
 * Init the config values based on the given command line arguments.
 *
 * Supported command line arguments:
 * --apps-root-dir       The directory where app data is stored.
 *                       Default: "<homeDir>/.nrfconnect-apps"
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
};
