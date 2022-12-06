/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getGlobal } from '@electron/remote';
import fs from 'fs';
import path from 'path';

import { mkdirIfNotExists } from '../main/mkdir';

const getUserDataDir = () => getGlobal('userDataDir');

function setAppDirs(newAppDir, newAppDataDir, newAppLogDir) {
    window.appDir = newAppDir;
    window.appDataDir = newAppDataDir;
    window.appLogDir = newAppLogDir;
}

/**
 * Load an app from the given directory dynamically.
 *
 * @param {string} appDir the directory of the app to load.
 * @returns {Object} The loaded app object.
 */
const loadApp = appDir => {
    const moduleManifest = path.join(appDir, 'package.json');

    if (!fs.existsSync(moduleManifest)) {
        console.log(
            `Trying to load module, but package.json is missing in ${appDir}.`
        );
        return null;
    }

    // Using window.require instead of require, so that the bundler
    // ignores it when bundling core
    const app = window.require(appDir);

    return app.default ?? app;
};

const ensureDirExists = async dir => {
    try {
        await mkdirIfNotExists(dir);
    } catch {
        throw new Error(`Failed to create '${dir}'.`);
    }
};

/**
 * Initializes an app.
 *
 * Creates these directories needed for an app:
 * .../<userDataDir>/<appName>/
 * .../<userDataDir>/<appName>/logs/
 *
 * After that initializes the logger, loads the app and returns it.
 *
 * @param {string} appDir the directory of the app to load.
 * @param {boolean} skipLoading skip loading commonjs module
 * @returns {Promise<object>} Resolving to the loaded app.
 */
export default async (appDir, skipLoading = false) => {
    const appBaseName = path.basename(appDir);
    const userDataDir = getUserDataDir();
    const appDataDir = path.join(userDataDir, appBaseName);
    const appLogDir = path.join(appDataDir, 'logs');
    setAppDirs(appDir, appDataDir, appLogDir);

    await ensureDirExists(appDataDir);
    await ensureDirExists(appLogDir);

    if (skipLoading) return undefined;

    return loadApp(appDir);
};
