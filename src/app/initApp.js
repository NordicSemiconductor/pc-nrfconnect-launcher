/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getGlobal } from '@electron/remote';
import fs from 'fs';
import path from 'path';

import { ensureDirExists } from '../main/mkdir';

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

    // FIXME later: Do not do a file operation in the renderer process
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

/*
 * Initializes an app.
 *
 * Prepares the environment, creates the needed directories, loads the app, and returns it.
 *
 * @param {string} appDir the directory of the app to load.
 */
export default appDir => {
    const appBaseName = path.basename(appDir);
    const userDataDir = getUserDataDir();
    const appDataDir = path.join(userDataDir, appBaseName);
    const appLogDir = path.join(appDataDir, 'logs');
    setAppDirs(appDir, appDataDir, appLogDir);

    // FIXME later: Do this in the main process before launching an app
    ensureDirExists(appDataDir);
    ensureDirExists(appLogDir);

    return loadApp(appDir);
};
