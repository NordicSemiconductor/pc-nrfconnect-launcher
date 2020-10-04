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

const { existsSync } = require('fs');
const { resolve } = require('path');

const { execPath } = process;

// In order to correctly set the library search path of pc-nrfjprog-js module
// we need to set the environment variable before the module is loaded.
const nRFjprogSearchPath = [
    resolve(execPath, '../nrfjprog'),
    resolve(execPath, '../../Frameworks/nrfjprog'),
    resolve(process.cwd(), 'nrfjprog'),
    resolve(process.cwd(), 'node_modules/pc-nrfjprog-js/nrfjprog'),
].find(existsSync);

if (nRFjprogSearchPath) {
    process.env.NRFJPROG_LIBRARY_PATH = nRFjprogSearchPath;
    const original = process.env.LD_LIBRARY_PATH
        ? `:${process.env.LD_LIBRARY_PATH}`
        : '';
    process.env.LD_LIBRARY_PATH = `${nRFjprogSearchPath}${original}`;
}

const { Menu, ipcMain, dialog, app: electronApp } = require('electron');
const { argv } = require('yargs');

const config = require('./config');
const windows = require('./windows');
const apps = require('./apps');
const { createMenu } = require('./menu');
const handleDevtoolsRequest = require('./devtools');

// Ensure that nRFConnect runs in a directory where it has permission to write
process.chdir(electronApp.getPath('temp'));

config.init(argv);
global.homeDir = config.getHomeDir();
global.userDataDir = config.getUserDataDir();
global.appsRootDir = config.getAppsRootDir();

const applicationMenu = Menu.buildFromTemplate(createMenu(electronApp));

electronApp.on('ready', () => {
    handleDevtoolsRequest();

    Menu.setApplicationMenu(applicationMenu);
    apps.initAppsDirectory()
        .then(() => {
            if (config.getOfficialAppName()) {
                return windows.openOfficialAppWindow(
                    config.getOfficialAppName(),
                    config.getSourceName()
                );
            }
            if (config.getLocalAppName()) {
                return windows.openLocalAppWindow(config.getLocalAppName());
            }
            return windows.openLauncherWindow();
        })
        .catch(error => {
            dialog.showMessageBox(
                {
                    type: 'error',
                    title: 'Initialization error',
                    message: 'Error when starting application',
                    detail: error.message,
                    buttons: ['OK'],
                },
                () => electronApp.quit()
            );
        });
});

electronApp.on('window-all-closed', () => {
    electronApp.quit();
});

ipcMain.on('open-app-launcher', () => {
    windows.openLauncherWindow();
});

ipcMain.on('open-app', (event, app) => {
    windows.openAppWindow(app);
});

ipcMain.on('show-about-dialog', () => {
    const appWindow = windows.getFocusedAppWindow();
    if (appWindow) {
        const { app } = appWindow;
        const detail =
            `${app.description}\n\n` +
            `Version: ${app.currentVersion}\n` +
            `Official: ${app.isOfficial}\n` +
            `Supported engines: nRF Connect ${app.engineVersion}\n` +
            `Current engine: nRF Connect ${config.getVersion()}\n` +
            `App directory: ${app.path}`;
        dialog.showMessageBox(
            appWindow.browserWindow,
            {
                type: 'info',
                title: 'About',
                message: `${app.displayName || app.name}`,
                detail,
                icon: app.iconPath
                    ? app.iconPath
                    : `${config.getElectronResourcesDir()}/nrfconnect.png`,
                buttons: ['OK'],
            },
            () => {}
        );
    }
});

ipcMain.on('get-app-details', event => {
    const appWindow = windows.getFocusedAppWindow();
    if (appWindow) {
        event.sender.send('app-details', {
            coreVersion: config.getVersion(),
            corePath: config.getElectronRootPath(),
            homeDir: config.getHomeDir(),
            tmpDir: config.getTmpDir(),
            ...appWindow.app,
        });
    }
});
