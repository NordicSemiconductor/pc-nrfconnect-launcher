/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

// Run this as soon as possible, so that the user data folder is not already initialised by Electron
require('./setUserDataDir');

require('@electron/remote/main').initialize();

const { Menu, ipcMain, dialog, app: electronApp } = require('electron');
const { argv } = require('yargs');
const { join } = require('path');

const config = require('./config');
const windows = require('./windows');
const apps = require('./apps');
const { createMenu } = require('./menu');
const loadDevtools = require('./devtools');
const { createTextFile } = require('./fileUtil');
const fs = require('fs');

// Ensure that nRFConnect runs in a directory where it has permission to write
process.chdir(electronApp.getPath('temp'));

config.init(argv);
global.homeDir = config.getHomeDir();
global.userDataDir = config.getUserDataDir();
global.appsRootDir = config.getAppsRootDir();

electronApp.allowRendererProcessReuse = false;

electronApp.on('ready', async () => {
    loadDevtools();


    try {
        const bundlePath = `${config.getElectronResourcesDir()}/bundle/`;
        const appToLaunch = await apps.readAppInfo(bundlePath);
        if (await fs.existsSync(bundlePath)) {
            return windows.openAppWindow(appToLaunch);
        }
        const applications = await apps.getOfficialApps();
        const existingBleApp = applications.fulfilled.find(
            app => app.name === 'pc-nrfconnect-ble'
        );

        if (!existingBleApp || existingBleApp.currentVersion !== '3.0.1') {
            await apps.installOfficialApp(
                'pc-nrfconnect-ble',
                '3.0.1',
                'official'
            );
        }

        await windows.openOfficialAppWindow('pc-nrfconnect-ble', 'official');
    } catch (error) {
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
    }
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

ipcMain.on('show-about-dialog', event => {
    const appWindow = windows.getAppWindow(event.sender);
    if (appWindow) {
        const { app } = appWindow;
        const detail =
            `${app.description}\n\n` +
            `Version: ${app.currentVersion}\n` +
            `Official: ${app.isOfficial}\n` +
            `Supported engines: nRF Connect for Desktop ${app.engineVersion}\n` +
            `Current engine: nRF Connect for Desktop ${config.getVersion()}\n` +
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
                    : `${config.getElectronResourcesDir()}/icon.png`,
                buttons: ['OK'],
            },
            () => {}
        );
    }
});

ipcMain.on('get-app-details', event => {
    const appWindow = windows.getAppWindow(event.sender);
    if (appWindow) {
        event.sender.send('app-details', {
            coreVersion: config.getVersion(),
            corePath: config.getElectronRootPath(),
            homeDir: config.getHomeDir(),
            tmpDir: config.getTmpDir(),
            bundledJlink: config.bundledJlinkVersion(),
            ...appWindow.app,
        });
    }
});

/**
 * Let's store the full path to the executable if nRFConnect was started from a built package.
 * This execPath is stored in a known location, so e.g. VS Code extension can launch it even on
 * Linux where there's no standard installation location.
 */
if (electronApp.isPackaged) {
    createTextFile(
        join(global.userDataDir, 'execPath'),
        process.platform === 'linux' && process.env.APPIMAGE
            ? process.env.APPIMAGE
            : process.execPath
    ).catch(err => console.log(err.message));
}
