/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

('use strict');

// Run this as soon as possible, so that the user data folder is not already initialised by Electron
require('./setUserDataDir');

const { Menu, ipcMain, dialog, app: electronApp } = require('electron');
const { argv } = require('yargs');
const { verifySerialPortAvailable } = require('./serialport');

const config = require('./config');
const windows = require('./windows');
const apps = require('./apps');
const { createMenu } = require('./menu');
const loadDevtools = require('./devtools');
const {
    initializeDfu,
    addDfuListener,
    removeDfuListener,
    abortDfu,
    getDfuManifest,
    performDfu,
    getDeviceSetup,
} = require('./pc-ble-driver-js');

// Ensure that nRFConnect runs in a directory where it has permission to write
process.chdir(electronApp.getPath('temp'));

config.init(argv);
global.homeDir = config.getHomeDir();
global.userDataDir = config.getUserDataDir();
global.appsRootDir = config.getAppsRootDir();

const applicationMenu = Menu.buildFromTemplate(createMenu(electronApp));

electronApp.allowRendererProcessReuse = false;

electronApp.on('ready', () => {
    loadDevtools();

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
            ...appWindow.app,
        });
    }
});

ipcMain.on('verify-serialport-available', (event, { device, options }) => {
    verifySerialPortAvailable(device, options)
        .then(() => event.sender.send('serialport-available'))
        .catch(err => {
            event.sender.send('serialport-not-available', err);
        });
});

ipcMain.on('initialize-dfu', (event, { name, options }) => {
    initializeDfu(event, {
        name,
        options,
    });
});

ipcMain.on('dfu-add-listener', (_, { name, callback }) =>
    addDfuListener({ name, callback })
);

ipcMain.on('dfu-remove-listener', (_, name) => removeDfuListener(name));

ipcMain.on('dfu-abort', () => abortDfu());

ipcMain.on('dfu-get-manifest', (_, { filePath, callback }) =>
    getDfuManifest({ filePath, callback })
);

ipcMain.on('perform-dfu', (_, { filePath, callback }) => {
    performDfu(filePath, callback);
});

ipcMain.handle('ble-get-device-setup', () => getDeviceSetup());
