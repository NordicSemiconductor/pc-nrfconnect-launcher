/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const { ipcMain, ipcRenderer } = require('electron');

const channel = {
    get: 'setting:get',
    set: 'setting:set',
};

// Get
const registerGetHandlerFromMain = onGetSetting =>
    ipcMain.handle(channel.get, (_event, settingKey, defaultValue) =>
        onGetSetting(settingKey, defaultValue)
    );

const invokeGetFromRenderer = (settingKey, defaultValue) =>
    ipcRenderer.invoke(channel.get, settingKey, defaultValue);

// Set
const registerSetHandlerFromMain = onSetSetting =>
    ipcMain.on(channel.set, (_event, key, value) => onSetSetting(key, value));

const sendSetFromRenderer = (key, value) =>
    ipcRenderer.send(channel.set, key, value);

module.exports = {
    registerGetHandlerFromMain,
    registerSetHandlerFromMain,
    invokeGetFromRenderer,
    sendSetFromRenderer,
};
