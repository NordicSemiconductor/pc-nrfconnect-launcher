/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs';
import path from 'path';
import {
    getAppLogDir,
    getUserDataDir,
    logger,
    setAppDirs,
} from 'pc-nrfconnect-shared';

import { mkdirIfNotExists } from '../main/mkdir';

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

    // Using window.require instead of require, so that webpack
    // ignores it when bundling core
    return window.require(appDir);
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
 * @returns {Promise<object>} Resolving to the loaded app.
 */
export default async appDir => {
    const appBaseName = path.basename(appDir);
    const userDataDir = getUserDataDir();
    const appDataDir = path.join(userDataDir, appBaseName);
    const appLogDir = path.join(appDataDir, 'logs');
    setAppDirs(appDir, appDataDir, appLogDir);

    await ensureDirExists(appDataDir);
    await ensureDirExists(appLogDir);

    logger.addFileTransport(getAppLogDir());
    return loadApp(appDir);
};
