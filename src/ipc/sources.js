/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const { ipcMain, ipcRenderer } = require('electron');

const channel = {
    get: 'sources:get',
    add: 'sources:add',
    remove: 'sources:remove',
};

// Get
const registerGetHandlerFromMain = onGetSources =>
    ipcMain.handle(channel.get, onGetSources);

const invokeGetFromRenderer = () => ipcRenderer.invoke(channel.get);

// Add
const registerAddHandlerFromMain = onAddSource =>
    ipcMain.handle(channel.add, (_event, url) => onAddSource(url));

const invokeAddFromRenderer = url => ipcRenderer.invoke(channel.add, url);

// Remove
const registerRemoveHandlerFromMain = onRemoveSource =>
    ipcMain.handle(channel.remove, (_event, name) => onRemoveSource(name));

const invokeRemoveFromRenderer = name =>
    ipcRenderer.invoke(channel.remove, name);

module.exports = {
    registerGetHandlerFromMain,
    invokeGetFromRenderer,
    registerAddHandlerFromMain,
    invokeAddFromRenderer,
    registerRemoveHandlerFromMain,
    invokeRemoveFromRenderer,
};
