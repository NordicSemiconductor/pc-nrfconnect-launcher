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

import path from 'path';
import { remote } from 'electron';
import { loadModule } from './fileUtil';
import { mkdirIfNotExists } from '../../main/mkdir';

const getUserDataDir = () => remote.getGlobal('userDataDir');

// Directory of the currently loaded app.
let appDir;

// Directories used by currently loaded app.
let appDataDir;
let appLogDir;

/**
 * Initialize app directory paths and ensure that they are created.
 * Creates:
 * .../<userDataDir>/<appName>/
 * .../<userDataDir>/<appName>/logs/
 *
 * @param {string} appPath the filesystem path of the app to load.
 * @returns {Promise} resolved is all directories are present.
 */
function initAppDirectories(appPath) {
    appDir = appPath;
    const appBaseName = path.basename(appPath);
    const userDataDir = getUserDataDir();
    appDataDir = path.join(userDataDir, appBaseName);
    appLogDir = path.join(appDataDir, 'logs');
    return new Promise((resolve, reject) => (
        mkdirIfNotExists(appDataDir).catch(() => {
            reject(new Error(`Failed to create '${appDataDir}'.`));
        })
            .then(() => mkdirIfNotExists(appLogDir).catch(() => {
                reject(new Error(`Failed to create '${appLogDir}'.`));
            }))
            .then(resolve)
    ));
}

/**
 * Load an app from the given path.
 *
 * @param {string} appPath the filesystem path of the app to load.
 * @returns {Object} The loaded app object.
 */
function loadApp(appPath) {
    return loadModule(appPath);
}

/**
 * Get the filesystem path of the currently loaded app.
 *
 * @returns {string|undefined} Absolute path of current app.
 */
function getAppDir() {
    return appDir;
}

/**
 * Get the filesystem path of a file for the currently loaded app.
 *
 * @param {string} filename relative name of file in the app directory
 * @returns {string|undefined} Absolute path of file.
 */
function getAppFile(filename) {
    return path.resolve(getAppDir(), filename);
}

/**
 * Get the filesystem path of the data directory of currently loaded app.
 *
 * @returns {string|undefined} Absolute path of data directory of the current app.
 */
function getAppDataDir() {
    return appDataDir;
}

/**
 * Get the filesystem path of the log directory of currently loaded app.
 *
 * @returns {string|undefined} Absolute path of data directory of the current app.
 */
function getAppLogDir() {
    return appLogDir;
}

export {
    initAppDirectories,
    loadApp,
    getAppDir,
    getAppFile,
    getAppDataDir,
    getAppLogDir,
    getUserDataDir,
};
