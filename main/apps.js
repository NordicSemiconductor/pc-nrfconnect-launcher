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

const path = require('path');
const fs = require('fs');
const config = require('./config');
const yarn = require('./yarn');
const fileUtil = require('./fileUtil');

const APPS_DIR_INIT_ERROR = 'APPS_DIR_INIT_ERROR';
const APPS_UPDATE_ERROR = 'APPS_UPDATE_ERROR';

/**
 * Create package.json if it does not exist.
 *
 * @returns {Promise} promise that resolves if successful.
 */
function createPackageJsonIfNotExists() {
    return fileUtil.createJsonFileIfNotExists(config.getPackageJsonPath(), {
        private: true,
        dependencies: {},
    });
}

/**
 * Create yarn.lock if it does not exist.
 *
 * @returns {Promise} promise that resolves if successful.
 */
function createYarnLockIfNotExists() {
    return fileUtil.createTextFileIfNotExists(config.getYarnLockPath(), '');
}

/**
 * Create apps.json if it does not exist.
 *
 * @returns {Promise} promise that resolves if successful.
 */
function createAppsJsonIfNotExists() {
    return fileUtil.createJsonFileIfNotExists(config.getAppsJsonPath(), {});
}

/**
 * Create updates.json if it does not exist.
 *
 * @returns {Promise} promise that resolves if successful.
 */
function createUpdatesJsonIfNotExists() {
    return fileUtil.createJsonFileIfNotExists(config.getUpdatesJsonPath(), {});
}

/**
 * Download the apps.json file containing a list of official apps. The file
 * is downloaded from the configured url and written to the apps root dir.
 *
 * @returns {Promise} promise that resolves if successful.
 */
function downloadAppsJsonFile() {
    return fileUtil.downloadToFile(config.getAppsJsonUrl(), config.getAppsJsonPath())
        .catch(error => {
            const err = new Error(error.message);
            err.code = APPS_UPDATE_ERROR;
            throw err;
        });
}

/**
 * Create the updates.json file containing a list of installed apps that have
 * available updates. Uses the 'yarn outdated' command to get the list of
 * updates.
 *
 * @returns {Promise} promise that resolves if successful.
 */
function generateUpdatesJsonFile() {
    const fileName = config.getUpdatesJsonPath();
    return yarn.outdated()
        .then(outdatedApps => fileUtil.createJsonFile(fileName, outdatedApps))
        .catch(error => {
            const err = new Error(error.message);
            err.code = APPS_UPDATE_ERROR;
            throw err;
        });
}

/**
 * Initialize the apps root directory where we keep all apps. If some required
 * file or directory does not exist, it is created. Downloads the list of
 * official apps (apps.json) and generates the list of available updates
 * (updates.json).
 *
 * The returned promise may reject with error code:
 * - APPS_DIR_INIT_ERROR: Unrecoverable error during initialization. Could be
 *   filesystem issues, such as insufficient permissions, etc.
 * - APPS_UPDATE_ERROR: Update of apps.json or updates.json failed, but the
 *   application is still usable if the user does not need to install/upgrade
 *   apps.
 *
 * @returns {Promise} promise that resolves if successful.
 */
function initAppsDirectory() {
    return Promise.resolve()
        .then(() => fileUtil.mkdirIfNotExists(config.getAppsRootDir()))
        .then(() => fileUtil.mkdirIfNotExists(config.getNodeModulesDir()))
        .then(() => fileUtil.mkdirIfNotExists(config.getAppsLocalDir()))
        .then(() => createPackageJsonIfNotExists())
        .then(() => createYarnLockIfNotExists())
        .then(() => createAppsJsonIfNotExists())
        .then(() => createUpdatesJsonIfNotExists())
        .then(() => !config.isSkipUpdateApps() && downloadAppsJsonFile())
        .then(() => !config.isSkipUpdateApps() && generateUpdatesJsonFile())
        .catch(error => {
            if (error.code === APPS_UPDATE_ERROR) throw error;
            const err = new Error(error.message);
            err.code = APPS_DIR_INIT_ERROR;
            throw err;
        });
}

/**
 * Read app info from the given app directory. The returned object can
 * have name, displayName, currentVersion, description, path, isOfficial,
 * and iconPath. The iconPath is only returned if the app has an 'icon.png'
 * in the app directory.
 *
 * @param {string} appPath path to the app directory.
 * @returns {Promise} promise that resolves with app info.
 */
function readAppInfo(appPath) {
    return fileUtil.readJsonFile(`${appPath}/package.json`)
        .then(packageJson => {
            const iconPath = `${appPath}/icon.png`;
            return {
                name: packageJson.name,
                displayName: packageJson.displayName,
                currentVersion: packageJson.version,
                description: packageJson.description,
                path: appPath,
                iconPath: fs.existsSync(iconPath) ? iconPath : null,
                isOfficial: !appPath.startsWith(config.getAppsLocalDir()),
            };
        });
}

/**
 * Decorates the given official app object from apps.json with the information
 * we have about the installed app, such as current version, path, etc.
 *
 * @param {Object} officialApp an official app object from apps.json.
 * @returns {Promise} promise that resolves with a new, decorated, app object.
 */
function decorateWithInstalledAppInfo(officialApp) {
    const appDir = path.join(config.getNodeModulesDir(), officialApp.name);
    return readAppInfo(appDir)
        .then(installedAppInfo => Object.assign({}, installedAppInfo, officialApp));
}

/**
 * Decorates the given installed official app object with latest available
 * version. If the app does not have any updates, its currently installed
 * version is used as the latest.
 *
 * @param {Object} officialApp an official app object.
 * @param {Object} availableUpdates object with app name as key and latest
 * version as value.
 * @returns {Object} a new app object that has a latestVersion property.
 */
function decorateWithLatestVersion(officialApp, availableUpdates) {
    return Object.assign({}, officialApp, {
        latestVersion: availableUpdates[officialApp.name] || officialApp.currentVersion,
    });
}

/**
 * Convert from object map of official apps to array of official apps.
 * E.g. from { name: { ... } } to [ { name, ... } ].
 *
 * @param {Object} officialAppsObj official apps object.
 * @returns {Array} array of official apps.
 */
function officialAppsObjToArray(officialAppsObj) {
    const names = Object.keys(officialAppsObj);
    return names.map(name => Object.assign({}, { name }, officialAppsObj[name]));
}

/**
 * Get an array of all official apps. Both installed and not installed
 * apps are returned. The returned app objects may have the following
 * properties:
 * - name: The app name from apps.json.
 * - displayName: The displayName from apps.json.
 * - currentVersion: The version from the app's package.json.
 * - latestVersion: The latest available version from npm registry.
 * - description: The description from apps.json.
 * - path: The path to the app on the local file system.
 * - iconPath: The path to the app's icon on the local file system.
 * - isOfficial: Always true for official apps.
 *
 * @returns {Promise} promise that resolves with array of app objects.
 */
function getOfficialApps() {
    return Promise.all([
        fileUtil.readJsonFile(config.getAppsJsonPath()),
        fileUtil.readJsonFile(config.getPackageJsonPath()),
        fileUtil.readJsonFile(config.getUpdatesJsonPath()),
    ]).then(([officialApps, packageJson, availableUpdates]) => {
        const officialAppsArray = officialAppsObjToArray(officialApps);
        const promises = officialAppsArray.map(officialApp => {
            const isInstalled = !!packageJson.dependencies[officialApp.name];
            if (isInstalled) {
                return decorateWithInstalledAppInfo(officialApp)
                    .then(app => decorateWithLatestVersion(app, availableUpdates));
            }
            return Promise.resolve(officialApp);
        });
        return Promise.all(promises);
    });
}

/**
 * Get an array of all local apps. The returned app objects may have
 * the following properties:
 * - name: The app name from the app's package.json.
 * - displayName: The displayName from the app's package.json.
 * - currentVersion: The version from the app's package.json.
 * - description: The description from the app's package.json.
 * - path: The path to the app on the local file system.
 * - iconPath: The path to the app's icon on the local file system.
 * - isOfficial: Always false for local apps.
 *
 * @returns {Promise} promise that resolves with array of app objects.
 */
function getLocalApps() {
    const appsLocalDir = path.join(config.getAppsRootDir(), 'local');
    const appNames = fileUtil.listDirectories(appsLocalDir);
    const appDirs = appNames.map(name => path.join(appsLocalDir, name));
    const promises = appDirs.map(dir => readAppInfo(dir));
    return Promise.all(promises);
}

/**
 * Install official app from the npm registry.
 *
 * @param {string} name the app name.
 * @returns {Promise} promise that resolves/rejects with yarn output.
 */
function installOfficialApp(name) {
    return yarn.add(name);
}

/**
 * Remove official app.
 *
 * @param {string} name the app name.
 * @returns {Promise} promise that resolves/rejects with yarn output.
 */
function removeOfficialApp(name) {
    return yarn.remove(name);
}

module.exports = {
    initAppsDirectory,
    getOfficialApps,
    getLocalApps,
    installOfficialApp,
    removeOfficialApp,
    APPS_DIR_INIT_ERROR,
    APPS_UPDATE_ERROR,
};
