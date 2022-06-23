/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const { ipcMain, ipcRenderer } = require('electron');

const channel = 'get-config';

const registerHandlerFromMain = config =>
    ipcMain.on(channel, event => {
        event.returnValue = config;
    });

const getConfigSyncFromRenderer = () => ipcRenderer.sendSync(channel);

module.exports = {
    registerHandlerFromMain,
    getConfigSyncFromRenderer,
};
