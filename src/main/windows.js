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
        return path.join(electronResourcesDir, 'nrfconnect.ico');
    }
    return path.join(electronResourcesDir, 'nrfconnect.png');
}

function openLauncherWindow() {
    if (launcherWindow) {
        launcherWindow.show();
    } else {
        launcherWindow = browser.createWindow({
            title: `nRF Connect v${config.getVersion()}`,
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
        title: `nRF Connect v${config.getVersion()} - ${
            app.displayName || app.name
        }`,
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
    return apps.getOfficialApps().then(appList => {
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
