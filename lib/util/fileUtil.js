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

import fs from 'fs';
import os from 'os';
import path from 'path';
import { shell, remote } from 'electron';
import childProcess from 'child_process';

/**
 * Get path to the user's home directory.
 *
 * @returns {string} path to home directory.
 */
function getHomeDir() {
    return remote.getGlobal('homeDir');
}

/**
 * Get path to the apps root directory. Will be $HOME/.nrfconnect-apps
 * unless this has been overridden with a command line flag.
 *
 * @returns {string} path to the apps root directory.
 */
function getAppsRootDir() {
    return remote.getGlobal('appsRootDir');
}

/**
 * Get path to the 'local' directory inside the apps root directory.
 *
 * @returns {string} path to apps-root-dir/local.
 */
function getAppLocalDir() {
    return path.join(getAppsRootDir(), 'local');
}

/**
 * List directories directly below the given path.
 *
 * @param {string} dirPath the path to look inside.
 * @returns {string[]} directory names.
 */
function listDirectories(dirPath) {
    if (fs.existsSync(dirPath)) {
        return fs.readdirSync(dirPath)
            .filter(file => {
                const fileStats = fs.statSync(path.join(dirPath, file));
                return fileStats.isDirectory();
            });
    }
    return [];
}

/**
 * Open the given package.json file path and read the given properties
 * into an object.
 *
 * @param {string} filePath path to a package.json file.
 * @param {string[]} properties the properties that should be extracted.
 * @returns {Object} an object with the given properties from package.json.
 */
function readPackageJson(filePath, properties) {
    const stringContents = fs.readFileSync(filePath);
    const packageJson = JSON.parse(stringContents);
    const obj = {};
    properties.forEach(property => {
        obj[property] = packageJson[property];
    });
    return obj;
}

/**
 * Check if the given app is official or not. Official apps are located
 * in appsRootDir, while unofficial apps are in appsRootDir/local.
 *
 * @param {string} appPath path to the app.
 * @param {string} appsRootDir root directory for apps.
 * @returns {boolean} true if official, false if not.
 */
function isOfficialApp(appPath, appsRootDir) {
    return !appPath.startsWith(path.join(appsRootDir, 'local'));
}

/**
 * Read app info from the given app directory. The returned object can
 * have name, displayName, version, description, path, isOfficial, and
 * iconPath. The iconPath is only returned if the app has an 'icon.png'
 * in the app directory.
 *
 * @param {string} appPath path to the app directory.
 * @returns {Object} object with app info.
 */
function readAppInfo(appPath) {
    const iconPath = `${appPath}/icon.png`;
    const appInfo = readPackageJson(`${appPath}/package.json`, [
        'name',
        'displayName',
        'version',
        'description',
    ]);
    appInfo.path = appPath;
    appInfo.isOfficial = isOfficialApp(appPath, getAppsRootDir());
    if (fs.existsSync(iconPath)) {
        appInfo.iconPath = iconPath;
    }
    return appInfo;
}

/**
 * Load a node module dynamically.
 *
 * @param {string} modulePath path too the module directory.
 * @returns {Object} the object that the module exports.
 */
function loadModule(modulePath) {
    const moduleManifest = path.join(modulePath, 'package.json');

    if (!fs.existsSync(moduleManifest)) {
        console.log('Trying to load module, but package.json ' +
            `is missing in ${modulePath}.`);
        return null;
    }

    // Using window.require instead of require, so that webpack
    // ignores it when bundling core
    return window.require(modulePath);
}

/**
 * Open a file in the default text application, depending on the user's OS.
 *
 * @param {string} filePath path to the file to open.
 * @param {function} callback signature: (error) => {}.
 * @returns {void}
 */
function openFileInDefaultApplication(filePath, callback) {
    fs.exists(filePath, exists => {
        if (!exists) {
            if (callback) {
                callback(new Error(`Could not find file at path: ${filePath}`));
            }
            return;
        }

        const escapedPath = filePath.replace(/ /g, '\\ ');

        // Could not find a method that works on all three platforms:
        // * shell.openItem works on Windows and Linux but not on OSX
        // * childProcess.execSync works on OSX but not on Windows
        if (os.type() === 'Darwin') {
            childProcess.execSync(`open ${escapedPath}`);
        } else {
            shell.openItem(escapedPath);
        }
        if (callback) {
            callback();
        }
    });
}

export default {
    getHomeDir,
    getAppLocalDir,
    listDirectories,
    readPackageJson,
    readAppInfo,
    loadModule,
    openFileInDefaultApplication,
};
