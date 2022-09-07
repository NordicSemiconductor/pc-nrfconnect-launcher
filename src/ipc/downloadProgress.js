/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const { ipcRenderer } = require('electron');
const { sendToLauncherWindowFromMain } = require('./sendToLauncherWindow');

const channel = 'download-progress';

const registerHandlerFromRenderer = onDownloadProgress =>
    ipcRenderer.on(channel, (_event, progress) => onDownloadProgress(progress));

const sendFromMain = progress =>
    sendToLauncherWindowFromMain(channel, progress);

module.exports = {
    sendFromMain,
    registerHandlerFromRenderer,
};
