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
const argv = require('yargs').argv;

const config = require('./main/config');
const apps = require('./main/apps');
const browser = require('./main/browser');
const settings = require('./main/settings');
const createMenu = require('./main/menu').createMenu;

const electronApp = electron.app;
const Menu = electron.Menu;
const ipcMain = electron.ipcMain;
const dialog = electron.dialog;

config.init(argv);
global.homeDir = config.getHomeDir();
global.userDataDir = config.getUserDataDir();
global.appsRootDir = config.getAppsRootDir();

const applicationMenu = Menu.buildFromTemplate(createMenu(electronApp));
Menu.setApplicationMenu(applicationMenu);

let launcherWindow;
const appWindows = [];

function openLauncherWindow() {
    launcherWindow = browser.createWindow({
        title: `nRF Connect v${config.getVersion()}`,
        url: `file://${__dirname}/resources/launcher.html`,
        icon: `${__dirname}/resources/nrfconnect.png`,
        width: 670,
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

function openAppWindow(app) {
    const lastWindowState = settings.loadLastWindow();
    const appWindow = browser.createWindow({
        title: `nRF Connect v${config.getVersion()} - ${app.displayName || app.name}`,
        url: `file://${__dirname}/resources/app.html?appPath=${app.path}`,
        icon: app.iconPath ? app.iconPath : `${__dirname}/resources/nrfconnect.png`,
        x: lastWindowState.x,
        y: lastWindowState.y,
        width: lastWindowState.width,
        height: lastWindowState.height,
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
        const index = appWindows.findIndex(appWin => appWin.browserWindow === appWindow);
        if (index > -1) {
            appWindows.splice(index, 1);
        }
        if (appWindows.length === 0) {
            electronApp.quit();
        }
    });
}

electronApp.on('ready', () => {
    apps.initAppsDirectory()
        .then(() => openLauncherWindow())
        .catch(error => {
            if (error.code === apps.APPS_DIR_INIT_ERROR) {
                dialog.showMessageBox({
                    type: 'error',
                    title: 'Initialization error',
                    message: 'Unable to initialize apps directory',
                    detail: error.message,
                    buttons: ['OK'],
                }, () => electronApp.quit());
            } else if (error.code === apps.APPS_UPDATE_ERROR) {
                dialog.showMessageBox({
                    type: 'warning',
                    title: 'Network problem',
                    message: 'Unable to update the official apps list',
                    detail: error.message,
                    buttons: ['OK'],
                }, () => openLauncherWindow());
            } else {
                dialog.showMessageBox({
                    type: 'error',
                    title: 'Initialization error',
                    message: 'Error when starting application',
                    detail: error.message,
                    buttons: ['OK'],
                }, () => electronApp.quit());
            }
        });
});

electronApp.on('window-all-closed', () => {
    electronApp.quit();
});

ipcMain.on('open-app-launcher', () => {
    if (!launcherWindow.isVisible()) {
        launcherWindow.show();
    }
});

ipcMain.on('open-app', (event, app) => {
    if (launcherWindow.isVisible()) {
        launcherWindow.hide();
    }
    openAppWindow(app);
});

ipcMain.on('show-about-dialog', () => {
    const parentWindow = electron.BrowserWindow.getFocusedWindow();
    const appWindow = appWindows.find(appWin => appWin.browserWindow === parentWindow);
    if (appWindow) {
        const app = appWindow.app;
        const detail = `${app.description}\n\n` +
            `Version: ${app.currentVersion}\n` +
            `Official: ${app.isOfficial}\n` +
            `Supported engines: nRF Connect ${app.engineVersion}\n` +
            `Current engine: nRF Connect ${config.getVersion()}\n` +
            `App directory: ${app.path}`;
        dialog.showMessageBox(parentWindow, {
            type: 'info',
            title: 'About',
            message: `${app.displayName || app.name}`,
            detail,
            icon: app.iconPath ? app.iconPath : `${__dirname}/resources/nrfconnect.png`,
            buttons: ['OK'],
        }, () => {});
    }
});
