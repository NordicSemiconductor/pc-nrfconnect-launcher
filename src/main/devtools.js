/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const { app, session } = require('electron');
const { exit } = require('process');
const path = require('path');
const fs = require('fs');

let devToolsInstaller;
let installExtension;
let REACT_DEVELOPER_TOOLS;
let REDUX_DEVTOOLS;

try {
    devToolsInstaller = require('electron-devtools-installer'); // eslint-disable-line global-require
} catch (err) {
    // Ignore missing devtools dependency here, check later for it when needed
}

if (devToolsInstaller) {
    installExtension = devToolsInstaller.default;
    REACT_DEVELOPER_TOOLS = devToolsInstaller.REACT_DEVELOPER_TOOLS;
    REDUX_DEVTOOLS = devToolsInstaller.REDUX_DEVTOOLS;
}

const installDevtools = async () => {
    if (!devToolsInstaller) return;
    try {
        await installExtension(REDUX_DEVTOOLS);
        await installExtension(REACT_DEVELOPER_TOOLS);
        console.log('Added devtool extensions');
        app.quit();
    } catch (err) {
        console.log('An error occurred while adding the devtools: ', err);
        exit(1);
    }
};

// Look for installed extensions and remove them
const removeDevtools = () => {
    if (!devToolsInstaller) return;
    try {
        [REDUX_DEVTOOLS.id, REACT_DEVELOPER_TOOLS.id].forEach(id => {
            const extensionPath = path.join(
                session.defaultSession.getStoragePath(),
                'extensions',
                id
            );

            if (fs.existsSync(extensionPath)) {
                fs.rmdirSync(extensionPath, { recursive: true });
            }
        });
        exit(0);
    } catch (err) {
        console.log('An error occurred while removing devtools: ', err);
        exit(1);
    }
};

// Look for installed extensions and load them
const loadInstalledDevtools = () => {
    if (!devToolsInstaller) return;
    try {
        const storagePath = session.defaultSession.getStoragePath();
        [REDUX_DEVTOOLS.id, REACT_DEVELOPER_TOOLS.id].forEach(id => {
            const extensionPath = path.join(storagePath, 'extensions', id);

            if (fs.existsSync(extensionPath)) {
                session.defaultSession.loadExtension(extensionPath, {
                    allowFileAccess: true,
                });
            }
        });
    } catch (err) {
        console.log(
            'An error occurred while loading installed devtools: ',
            err
        );
        exit(1);
    }
};

module.exports = () => {
    if (process.argv.includes('--install-devtools')) {
        installDevtools();
        return;
    }

    if (process.argv.includes('--remove-devtools')) {
        removeDevtools();
        return;
    }

    loadInstalledDevtools();
};
