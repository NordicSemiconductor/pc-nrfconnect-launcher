/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const { ipcMain, ipcRenderer } = require('electron');

const channel = 'download-to-file';

const registerHandlerFromMain = onDownloadToFile =>
    ipcMain.handle(channel, (_event, url, filePath) =>
        onDownloadToFile(url, filePath, false)
    );

const invokeFromRenderer = (url, filePath) =>
    ipcRenderer.invoke(channel, url, filePath);

module.exports = {
    registerHandlerFromMain,
    invokeFromRenderer,
};
