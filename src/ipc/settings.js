/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const { ipcMain, ipcRenderer } = require('electron');

const channel = {
    get: 'setting:get',
    getSources: 'setting:get-sources',
    set: 'setting:set',
    setSources: 'setting:set-sources',
};

// Get
const registerGetHandlerFromMain = onGetSetting =>
    ipcMain.handle(channel.get, (_event, settingKey, defaultValue) =>
        onGetSetting(settingKey, defaultValue)
    );

const invokeGetFromRenderer = (settingKey, defaultValue) =>
    ipcRenderer.invoke(channel.get, settingKey, defaultValue);

// GetSources
const registerGetSourcesHandlerFromMain = onGetSourcesSetting =>
    ipcMain.handle(channel.getSources, () => onGetSourcesSetting());

const invokeGetSourcesFromRenderer = () =>
    ipcRenderer.invoke(channel.getSources);

// Set
const registerSetHandlerFromMain = onSetSetting =>
    ipcMain.on(channel.set, (_event, key, value) => onSetSetting(key, value));

const sendSetFromRenderer = (key, value) =>
    ipcRenderer.send(channel.set, key, value);

// SetSources
const registerSetSourcesHandlerFromMain = onSetSourcesSetting =>
    ipcMain.on(channel.setSources, (_event, sources) =>
        onSetSourcesSetting(sources)
    );

const sendSetSourcesFromRenderer = sources =>
    ipcRenderer.send(channel.setSources, sources);

module.exports = {
    registerGetHandlerFromMain,
    registerGetSourcesHandlerFromMain,
    registerSetHandlerFromMain,
    registerSetSourcesHandlerFromMain,
    invokeGetFromRenderer,
    invokeGetSourcesFromRenderer,
    sendSetFromRenderer,
    sendSetSourcesFromRenderer,
};
