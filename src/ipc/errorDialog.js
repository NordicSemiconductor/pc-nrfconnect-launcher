/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const { ipcRenderer } = require('electron');
const { sendToLauncherWindowFromMain } = require('./sendToLauncherWindow');

const channel = 'show-error-dialog';

const registerHandlerFromRenderer = onShowErrorDialog =>
    ipcRenderer.on(channel, (_event, errorMessage) =>
        onShowErrorDialog(errorMessage)
    );

const sendFromMain = errorMessage =>
    sendToLauncherWindowFromMain(channel, errorMessage);

module.exports = {
    sendFromMain,
    registerHandlerFromRenderer,
};
