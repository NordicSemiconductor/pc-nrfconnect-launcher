/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const { ipcMain, ipcRenderer } = require('electron');

const channel = 'create-desktop-shortcut';

const registerHandlerFromMain = onCreateDesktopShortcut =>
    ipcMain.on(channel, (_event, app) => onCreateDesktopShortcut(app));

const sendFromRenderer = app => ipcRenderer.send(channel, app);

module.exports = {
    registerHandlerFromMain,
    sendFromRenderer,
};
