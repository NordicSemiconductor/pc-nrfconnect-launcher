/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const { ipcMain, ipcRenderer } = require('electron');

const channel = {
    checkForUpdate: 'launcher-update:check',
    startUpdate: 'launcher-update:start',
    cancelUpdate: 'launcher-update:cancel',
};

const registerCheckForUpdateHandlerFromMain = onCheckForUpdate =>
    ipcMain.handle(channel.checkForUpdate, onCheckForUpdate);

const registerStartUpdateHandlerFromMain = onStartUpdate =>
    ipcMain.on(channel.startUpdate, onStartUpdate);

const registerCancelUpdateHandlerFromMain = onCancelUpdate =>
    ipcMain.on(channel.cancelUpdate, onCancelUpdate);

const invokeCheckForUpdateFromRenderer = () =>
    ipcRenderer.invoke(channel.checkForUpdate);

const sendStartUpdateFromRender = () => ipcRenderer.send(channel.startUpdate);
const sendCancelUpdateFromRender = () => ipcRenderer.send(channel.cancelUpdate);

module.exports = {
    registerCheckForUpdateHandlerFromMain,
    registerStartUpdateHandlerFromMain,
    registerCancelUpdateHandlerFromMain,
    invokeCheckForUpdateFromRenderer,
    sendStartUpdateFromRender,
    sendCancelUpdateFromRender,
};
