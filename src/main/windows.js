/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

const electron = require('electron');
const path = require('path');
const browser = require('./browser');
const config = require('./config');
const settings = require('./settings');
const apps = require('./apps');

let launcherWindow;
const appWindows = [];

function getDefaultIconPath() {
    const electronResourcesDir = config.getElectronResourcesDir();
    if (process.platform === 'win32') {
        return path.join(electronResourcesDir, 'icon.ico');
    }
    return path.join(electronResourcesDir, 'icon.png');
}

function openLauncherWindow() {
    if (launcherWindow) {
        launcherWindow.show();
    } else {
        launcherWindow = browser.createWindow({
            title: `nRF Connect for Desktop v${config.getVersion()}`,
            url: `file://${config.getElectronResourcesDir()}/launcher.html`,
            icon: getDefaultIconPath(),
            width: 760,
            height: 500,
            center: true,
            splashScreen: !config.isSkipSplashScreen(),
        });

        launcherWindow.on('close', event => {
            if (appWindows.length > 0) {
                event.preventDefault();
                launcherWindow.hide();
            }
        });
    }
}

function hideLauncherWindow() {
    launcherWindow.hide();
}

function openAppWindow(app) {
    const lastWindowState = settings.loadLastWindow();

    let { x, y } = lastWindowState;
    const { width, height } = lastWindowState;
    if (x && y) {
        const { bounds } = electron.screen.getDisplayMatching(lastWindowState);
        const left = Math.max(x, bounds.x);
        const top = Math.max(y, bounds.y);
        const right = Math.min(x + width, bounds.x + bounds.width);
        const bottom = Math.min(y + height, bounds.y + bounds.height);
        if (left > right || top > bottom) {
            // the window would be off screen, let's open it where the launcher is
            x = undefined;
            y = undefined;
        }
    }

    const appWindow = browser.createWindow({
        title: `${app.displayName || app.name} v${app.currentVersion}`,
        url: `file://${config.getElectronResourcesDir()}/app.html?appPath=${
            app.path
        }`,
        icon: app.iconPath ? app.iconPath : getDefaultIconPath(),
        x,
        y,
        width,
        height,
        show: true,
        backgroundColor: '#fff',
    });

    appWindows.push({
        browserWindow: appWindow,
        app,
    });

    appWindow.webContents.on('did-finish-load', () => {
        if (lastWindowState.maximized) {
            appWindow.maximize();
        }
    });

    appWindow.on('close', () => {
        settings.storeLastWindow(appWindow);
    });

    appWindow.on('closed', () => {
        const index = appWindows.findIndex(
            appWin => appWin.browserWindow === appWindow
        );
        if (index > -1) {
            appWindows.splice(index, 1);
        }
        if (
            appWindows.length === 0 &&
            !(launcherWindow && launcherWindow.isVisible())
        ) {
            electron.app.quit();
        }
    });
}

function openOfficialAppWindow(appName, sourceName) {
    return apps.getOfficialApps().then(({ fulfilled: appList }) => {
        const officialApp = appList.find(
            app => app.name === appName && app.source === sourceName
        );
        const isInstalled = officialApp && officialApp.path;
        if (isInstalled) {
            openAppWindow(officialApp);
        } else {
            throw new Error(
                `Tried to open app ${appName} from source ${sourceName}, but it is not installed`
            );
        }
    });
}

function openLocalAppWindow(appName) {
    return apps.getLocalApps().then(appList => {
        const localApp = appList.find(app => app.name === appName);
        if (localApp) {
            openAppWindow(localApp);
        } else {
            throw new Error(
                `Tried to open local app ${appName}, but it is not installed`
            );
        }
    });
}

function getFocusedAppWindow() {
    const parentWindow = electron.BrowserWindow.getFocusedWindow();
    return appWindows.find(appWin => appWin.browserWindow === parentWindow);
}

module.exports = {
    openLauncherWindow,
    openAppWindow,
    openOfficialAppWindow,
    openLocalAppWindow,
    hideLauncherWindow,
    getFocusedAppWindow,
};
