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
const fs = require('fs-extra');
const semver = require('semver');
const { dialog } = require('electron');
const Store = require('electron-store');

const config = require('./config');
const registryApi = require('./registryApi');
const fileUtil = require('./fileUtil');
const net = require('./net');
const settings = require('./settings');

const store = new Store({ name: 'pc-nrfconnect-launcher' });

/**
 * Create sources.json if it does not exist.
 *
 * @returns {Promise} promise that resolves if successful.
 */
function createSourcesJsonIfNotExists() {
    const sources = settings.getSources();
    settings.setSources(sources);
    return Promise.resolve(sources);
}

/**
 * Create apps.json if it does not exist.
 *
 * @param {string} source name of external source.
 * @returns {Promise} promise that resolves if successful.
 */
function createAppsJsonIfNotExists(source) {
    return fileUtil.createJsonFileIfNotExists(
        config.getAppsJsonPath(source),
        {}
    );
}

/**
 * Create updates.json if it does not exist.
 *
 * @param {string} source name of external source
 * @returns {Promise} promise that resolves if successful.
 */
function createUpdatesJsonIfNotExists(source) {
    return fileUtil.createJsonFileIfNotExists(
        config.getUpdatesJsonPath(source),
        {}
    );
}

/**
 * Initialize directory structure of a source under external apps.
 *
 * @param {string} source name of external source.
 * @returns {Promise} promise that resolves is successful.
 */
function initSourceDirectory(source) {
    return fileUtil
        .mkdirIfNotExists(config.getAppsRootDir(source))
        .then(() => fileUtil.mkdirIfNotExists(config.getNodeModulesDir(source)))
        .then(() => createAppsJsonIfNotExists(source))
        .then(() => createUpdatesJsonIfNotExists(source));
}

/**
 * Download the apps.json file containing a list of official apps. The file
 * is downloaded from the configured url and written to the apps root dir.
 *
 * @param {string} url URL of apps.json of external source
 * @param {string?} name optional name of the external source
 * @returns {Promise} promise that resolves if successful.
 */
function downloadAppsJsonFile(url, name) {
    return net
        .downloadToJson(url, true)
        .catch(error => {
            const wrappedError = new Error(
                `Unable to download apps list: ${error.message}. If you ` +
                    'are using a proxy server, you may need to configure it as described on ' +
                    'https://github.com/NordicSemiconductor/pc-nrfconnect-launcher'
            );
            wrappedError.statusCode = error.statusCode;
            wrappedError.cause = { name, url };
            throw wrappedError;
        })
        .then(appsJson => {
            // underscore is intentially used in JSON as a meta information
            // eslint-disable-next-line no-underscore-dangle
            const source = appsJson._source;
            if (!source && url !== config.getAppsJsonUrl()) {
                throw new Error('JSON does not contain expected `_source` tag');
            }
            return initSourceDirectory(source)
                .then(() =>
                    fileUtil.createJsonFile(
                        config.getAppsJsonPath(source),
                        appsJson
                    )
                )
                .then(() => source);
        });
}

/**
 * Download the apps.json file containing a list of official apps. The file
 * is downloaded from the configured url and written to the apps root dir.
 *
 * @param {string} source name of external source
 * @returns {Promise} promise that resolves if successful.
 */
function downloadAppsJsonFiles() {
    const sources = settings.getSources();
    const sequence = (source, ...rest) =>
        source
            ? downloadAppsJsonFile(sources[source], source).then(() =>
                  sequence(...rest)
              )
            : Promise.resolve();
    return sequence(...Object.keys(sources));
}

/**
 * Get the names of all apps that are installed for a specific source.
 *
 * @param {string} source name of external source
 * @returns {Promise} promise that resolves with app names.
 */
function getInstalledAppNames(source) {
    return fileUtil.readJsonFile(config.getAppsJsonPath(source)).then(apps => {
        const installedPackages = fileUtil.listDirectories(
            config.getNodeModulesDir(source)
        );
        const availableApps = Object.keys(apps);
        const installedApps = [];
        availableApps.forEach(availableApp => {
            if (installedPackages.includes(availableApp)) {
                installedApps.push(availableApp);
            }
        });
        return installedApps;
    });
}

/**
 * Create the updates.json file containing the latest available versions for
 * all installed official apps. Format: { "foo": "x.y.z", "bar: "x.y.z" }.
 *
 * @param {string} source name of external source
 * @returns {Promise} promise that resolves if successful.
 */
function generateUpdatesJsonFile(source) {
    const fileName = config.getUpdatesJsonPath(source);
    return getInstalledAppNames(source)
        .then(installedApps =>
            registryApi.getLatestPackageVersions(installedApps, source)
        )
        .then(latestVersions =>
            fileUtil.createJsonFile(fileName, latestVersions)
        );
}

/**
 * Create the updates.json file containing the latest available versions for
 * all installed official apps. Format: { "foo": "x.y.z", "bar: "x.y.z" }.
 *
 * @returns {Promise} promise that resolves if successful.
 */
function generateUpdatesJsonFiles() {
    const sources = settings.getSources();
    return Promise.all(
        Object.keys(sources).map(source => generateUpdatesJsonFile(source))
    );
}

/**
 * Show confirmation dialog about existing app directory to be removed.
 *
 * @param {string} tgzFilePath Path to the tgz file to install.
 * @param {string} appPath Path of the existing app directory.
 * @returns {Promise} promise that resolves when all is done.
 */
function confirmAndRemoveOldLocalApp(tgzFilePath, appPath) {
    return new Promise(resolve => {
        dialog.showMessageBox(
            {
                type: 'question',
                title: 'Existing app directory',
                message:
                    `Tried to extract archive ${tgzFilePath}, ` +
                    `but app directory ${appPath} already exists.\n\n` +
                    'Do you want to remove existing app in order to extract the archive?',
                buttons: ['Remove', 'Cancel'],
            },
            btnIndex => {
                if (btnIndex === 0) {
                    return fs.remove(appPath).then(resolve);
                }
                return resolve();
            }
        );
    });
}

/**
 * Extract the given *.tgz archive to the apps local directory.
 *
 * @param {string} tgzFilePath Path to the tgz file to install.
 * @returns {Promise} promise that resolves if successful.
 */
function installLocalAppArchive(tgzFilePath) {
    const appName = fileUtil.getNameFromNpmPackage(tgzFilePath);
    if (!appName) {
        return Promise.reject(
            new Error(
                'Unable to get app name from archive: ' +
                    `${tgzFilePath}. Expected file name format: {name}-{version}.tgz.`
            )
        );
    }
    const appPath = path.join(config.getAppsLocalDir(), appName);
    return fs
        .exists(appPath)
        .then(isInstalled => {
            if (isInstalled) {
                return confirmAndRemoveOldLocalApp(tgzFilePath, appPath);
            }
            return Promise.resolve();
        })
        .then(() => fs.exists(appPath))
        .then(isInstalled => {
            if (!isInstalled) {
                return fileUtil
                    .mkdir(appPath)
                    .then(() =>
                        fileUtil.extractNpmPackage(
                            appName,
                            tgzFilePath,
                            appPath
                        )
                    )
                    .then(() => fileUtil.deleteFile(tgzFilePath));
            }
            return Promise.resolve();
        });
}

/**
 * Extract all *.tgz archives that exist in the apps local directory.
 *
 * @returns {Promise} promise that resolves if successful.
 */
function installLocalAppArchives() {
    const appsLocalDir = config.getAppsLocalDir();
    const tgzFiles = fileUtil.listFiles(appsLocalDir, /\.tgz$/);
    return tgzFiles.reduce(
        (prev, tgzFile) =>
            prev.then(() =>
                installLocalAppArchive(path.join(appsLocalDir, tgzFile))
            ),
        Promise.resolve()
    );
}

/**
 * Initialize the apps root directory where we keep all apps. If some required
 * file or directory does not exist, it is created. Any *.tgz archives that
 * exist in the apps local directory are extracted.
 *
 * @returns {Promise} promise that resolves if successful.
 */
function initAppsDirectory() {
    return Promise.resolve()
        .then(() => fileUtil.mkdirIfNotExists(config.getAppsRootDir()))
        .then(() => fileUtil.mkdirIfNotExists(config.getAppsLocalDir()))
        .then(() => fileUtil.mkdirIfNotExists(config.getAppsExternalDir()))
        .then(() => fileUtil.mkdirIfNotExists(config.getNodeModulesDir()))
        .then(() => createSourcesJsonIfNotExists())
        .then(sources =>
            Promise.all(
                Object.keys(sources).map(source => initSourceDirectory(source))
            )
        )
        .then(() => installLocalAppArchives());
}

/**
 * Get the engines.nrfconnect value from the given package.json object.
 * This is a semver range that indicates which core version(s) the app
 * supports. Returns null if no value is specified.
 *
 * @param {Object} packageJson the package.json object.
 * @returns {string|null} semver range indicating supported core version(s)
 */
function getEngineVersion(packageJson) {
    return packageJson.engines ? packageJson.engines.nrfconnect : null;
}

/**
 * Checks if the given core engine version is compatible with the
 * engines.nrfconnect definition in the given package.json object.
 *
 * @param {string} coreEngineVersion core engine version.
 * @param {Object} packageJson package.json object to check.
 * @returns {boolean} true if version is compatible, false if not
 */
function isSupportedEngine(coreEngineVersion, packageJson) {
    // The semver.satisfies() check will return false if receiving a pre-release
    // (e.g. 2.0.0-alpha.0), so stripping away the pre-release part.
    const currentEngine = [
        semver.major(coreEngineVersion),
        semver.minor(coreEngineVersion),
        semver.patch(coreEngineVersion),
    ].join('.');
    return semver.satisfies(currentEngine, getEngineVersion(packageJson));
}

/**
 * Read app info from the given app directory. The returned object can
 * have name, displayName, currentVersion, description, path, isOfficial,
 * engineVersion, isSupportedEngine, and iconPath. The iconPath is only
 * returned if the app has an 'icon.png' in the app directory.
 *
 * @param {string} appPath path to the app directory.
 * @returns {Promise} promise that resolves with app info.
 */
function readAppInfo(appPath) {
    const packageJsonPath = path.join(appPath, 'package.json');
    return fileUtil.readJsonFile(packageJsonPath).then(packageJson => {
        const resourcesPath = path.join(appPath, 'resources');
        let iconPath = path.join(resourcesPath, 'icon.png');
        if (!fs.existsSync(iconPath)) {
            iconPath = path.join(appPath, 'icon.png');
        }

        let shortcutIconPath;
        if (process.platform === 'win32') {
            shortcutIconPath = path.join(resourcesPath, 'icon.ico');
        } else if (process.platform === 'darwin') {
            shortcutIconPath = path.join(resourcesPath, 'icon.icns');
        }
        if (!fs.existsSync(shortcutIconPath)) {
            shortcutIconPath = iconPath;
        }

        const isOfficial = !appPath.startsWith(config.getAppsLocalDir());
        const source = isOfficial
            ? path.basename(path.dirname(path.dirname(appPath)))
            : null;

        return {
            name: packageJson.name,
            displayName: packageJson.displayName,
            currentVersion: packageJson.version,
            description: packageJson.description,
            path: appPath,
            iconPath: fs.existsSync(iconPath) ? iconPath : null,
            shortcutIconPath: fs.existsSync(shortcutIconPath)
                ? shortcutIconPath
                : null,
            isOfficial,
            engineVersion: getEngineVersion(packageJson),
            isSupportedEngine: isSupportedEngine(
                config.getVersion(),
                packageJson
            ),
            source,
            repositoryUrl: packageJson.repository && packageJson.repository.url,
        };
    });
}

/**
 * Decorates the given official app object from apps.json with the information
 * we have about the installed app, such as current version, path, etc.
 *
 * @param {Object} officialApp an official app object from apps.json.
 * @param {string} source name of external source.
 * @returns {Promise} promise that resolves with a new, decorated, app object.
 */
function decorateWithInstalledAppInfo(officialApp, source) {
    const appDir = path.join(
        config.getNodeModulesDir(source),
        officialApp.name
    );
    return readAppInfo(appDir).then(installedAppInfo => ({
        ...installedAppInfo,
        ...officialApp,
    }));
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
    const latestVersion =
        availableUpdates[officialApp.name] || officialApp.currentVersion;
    return {
        ...officialApp,
        latestVersion,
        upgradeAvailable:
            latestVersion && officialApp.currentVersion !== latestVersion,
    };
}

/**
 * Convert from object map of official apps to array of official apps.
 * E.g. from { name: { ... } } to [ { name, ... } ].
 *
 * @param {Object} officialAppsObj official apps object.
 * @param {string} source name of external source.
 * @returns {Array} array of official apps.
 */
function officialAppsObjToArray(officialAppsObj, source) {
    const names = Object.keys(officialAppsObj);
    return names
        .map(name => ({ name, source, ...officialAppsObj[name] }))
        .filter(app => app.name && app.name !== '_source');
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
 * @param {string} source name of external source.
 * @returns {Promise} promise that resolves with array of app objects.
 */
function getOfficialAppsFromSource(source) {
    return Promise.all([
        fileUtil.readJsonFile(config.getAppsJsonPath(source)),
        fileUtil.readJsonFile(config.getUpdatesJsonPath(source)),
    ]).then(([officialApps, availableUpdates]) => {
        const { ...cleanedApps } = officialApps;
        const officialAppsArray = officialAppsObjToArray(cleanedApps, source);
        const promises = officialAppsArray.map(officialApp =>
            fs
                .exists(
                    path.join(
                        config.getNodeModulesDir(source),
                        officialApp.name
                    )
                )
                .then(isInstalled => {
                    if (isInstalled) {
                        return decorateWithInstalledAppInfo(
                            officialApp,
                            source
                        ).then(app =>
                            decorateWithLatestVersion(app, availableUpdates)
                        );
                    }
                    return Promise.resolve(officialApp);
                })
        );
        return Promise.all(promises);
    });
}

function getOfficialApps() {
    const sources = settings.getSources();
    return Promise.all(
        Object.keys(sources).map(source => getOfficialAppsFromSource(source))
    ).then(arrayOfArrays =>
        arrayOfArrays.reduce(
            (accumulator, currentValue) => [...accumulator, ...currentValue],
            []
        )
    );
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
 * Remove official app.
 *
 * @param {string} name the app name.
 * @param {string} [source] name of external source.
 * @returns {Promise} promise that resolves if successful.
 */
function removeOfficialApp(name, source) {
    const appPath = path.join(config.getNodeModulesDir(source), name);
    if (!appPath.includes('node_modules')) {
        return Promise.reject(
            new Error(
                'Sanity check failed when trying ' +
                    `to remove app directory ${appPath}. The directory does not ` +
                    'have node_modules in its path.'
            )
        );
    }

    const tmpDir = fileUtil.getTmpFilename(name);

    return fs.move(appPath, tmpDir).then(() => fs.remove(tmpDir));
}

/**
 * Install official app from the npm registry.
 *
 * @param {string} name the app name.
 * @param {string} version the app version, e.g. '1.2.3' or 'latest'.
 * @param {string} [source] name of external source.
 * @returns {Promise} promise that resolves if successful.
 */
function installOfficialApp(name, version, source) {
    const destinationDir = config.getAppsRootDir(source);
    return registryApi
        .downloadTarball(name, version, destinationDir, source)
        .then(tgzFilePath => {
            const appPath = path.join(config.getNodeModulesDir(source), name);
            return fs
                .exists(appPath)
                .then(isInstalled => {
                    if (isInstalled) {
                        return removeOfficialApp(name, source);
                    }
                    return Promise.resolve();
                })
                .then(() =>
                    fileUtil.extractNpmPackage(name, tgzFilePath, appPath)
                )
                .then(() => fileUtil.deleteFile(tgzFilePath));
        });
}

/**
 * Remove source directory structure
 *
 * @param {string} source name of source
 * @returns {Promise} promise that resolves is successful.
 */
function removeSourceDirectory(source) {
    if (!source || source === 'official') {
        // Sanity check, this cannot happen anyway
        return Promise.reject(
            new Error('The official source shall not be removed.')
        );
    }
    return fs.remove(config.getAppsRootDir(source));
}

const migrateStoreIfNeeded = () => {
    const oldStore = new Store({ name: 'pc-nrfconnect-core' });
    if (oldStore.size > 0 && store.size === 0) {
        store.store = JSON.parse(JSON.stringify(oldStore.store));
    }
};

const replacePrLinks = (homepage, changelog) =>
    changelog.replace(
        /#(\d+)/g,
        (match, pr) => `[${match}](${homepage}/pull/${pr})`
    );

/**
 * Download release notes.
 *
 * The release notes are also cached in the electron store. If the server did not report changed
 * release notes or was unable to respond, the cached release notes are used.
 *
 * @param {object} app object with properties for url, homepage and latestVersion
 * @returns {string | undefined} markdown formatted changelog or null if undefined could be fetched
 */
async function downloadReleaseNotes({ url, homepage }) {
    migrateStoreIfNeeded();

    const appDataPath = `apps.${url.replace(/\./g, '\\.')}`;
    try {
        const previousAppData = store.get(appDataPath, {});

        const previousEtag = previousAppData.changelog
            ? previousAppData.etag
            : undefined;
        const { response, etag } = await net.downloadToStringIfChanged(
            `${url}-Changelog.md`,
            previousEtag,
            false
        );
        if (response != null) {
            const changelog = replacePrLinks(homepage, response);
            store.set(appDataPath, { etag, changelog });
        }
    } catch (e) {
        // Ignore errors and just return what we have stored before
    }

    return store.get(appDataPath, {}).changelog;
}

module.exports = {
    initAppsDirectory,
    initSourceDirectory,
    downloadAppsJsonFile,
    downloadAppsJsonFiles,
    generateUpdatesJsonFiles,
    getOfficialApps,
    getLocalApps,
    installOfficialApp,
    removeOfficialApp,
    removeSourceDirectory,
    downloadReleaseNotes,
};
