/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

const electron = require('electron');
const config = require('./config');

function createSplashScreen(icon) {
    let splashScreen = new electron.BrowserWindow({
        width: 400,
        height: 223,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        show: false,
        transparent: true,
        icon,
    });
    splashScreen.loadURL(
        `file://${config.getElectronResourcesDir()}/splashscreen.html`
    );
    splashScreen.on('closed', () => {
        splashScreen = null;
    });
    splashScreen.show();
    return splashScreen;
}

function createWindow(options) {
    const appArgumentsIndex = process.argv.indexOf('--');
    const additionalArguments =
        appArgumentsIndex === -1 ? [] : process.argv.slice(appArgumentsIndex);

    const mergedOptions = {
        minWidth: 308,
        minHeight: 499,
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            additionalArguments,
        },
        ...options,
    };
    const browserWindow = new electron.BrowserWindow(mergedOptions);

    let splashScreen;
    if (options.splashScreen) {
        splashScreen = createSplashScreen(options.icon);
    }

    browserWindow.loadURL(options.url);

    // Never navigate away from the given url, e.g. when the
    // user drags and drops a file into the browser window.
    browserWindow.webContents.on('will-navigate', event => {
        event.preventDefault();
    });

    // Open target=_blank link in default browser instead of a
    // new electron window.
    browserWindow.webContents.on('new-window', (event, url) => {
        electron.shell.openExternal(url);
        event.preventDefault();
    });

    browserWindow.webContents.once('ready-to-show', () => {
        browserWindow.show();
        if (splashScreen && !splashScreen.isDestroyed()) {
            splashScreen.close();
        }
    });

    return browserWindow;
}

module.exports = {
    createWindow,
};
