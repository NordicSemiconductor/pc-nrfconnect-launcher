/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ipcMain, ipcRenderer } from 'electron';

const channel = {
    get: 'sources:get',
    add: 'sources:add',
    remove: 'sources:remove',
};

// Get
export const registerGetHandlerFromMain = (
    onGetSources: () => Record<string, string>
) => ipcMain.handle(channel.get, onGetSources);

export const invokeGetFromRenderer = (): Promise<Record<string, string>> =>
    ipcRenderer.invoke(channel.get);

// Add
export const registerAddHandlerFromMain = (
    onAddSource: typeof invokeAddFromRenderer
) => ipcMain.handle(channel.add, (_event, url) => onAddSource(url));

export const invokeAddFromRenderer = (url: string): Promise<string> =>
    ipcRenderer.invoke(channel.add, url);

// Remove
export const registerRemoveHandlerFromMain = (
    onRemoveSource: typeof invokeRemoveFromRenderer
) => ipcMain.handle(channel.remove, (_event, name) => onRemoveSource(name));

export const invokeRemoveFromRenderer = (name: string): Promise<void> =>
    ipcRenderer.invoke(channel.remove, name);
