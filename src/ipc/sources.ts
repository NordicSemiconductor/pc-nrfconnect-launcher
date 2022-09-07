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
export const invokeGetFromRenderer = (): Promise<Record<string, string>> =>
    ipcRenderer.invoke(channel.get);

type Handler = (
    ...args: Parameters<typeof invokeGetFromRenderer>
) => Awaited<ReturnType<typeof invokeGetFromRenderer>>;

export const registerGetHandlerFromMain = (onGetSources: Handler) =>
    ipcMain.handle(channel.get, onGetSources);

// Add
export const invokeAddFromRenderer = (url: string): Promise<string> =>
    ipcRenderer.invoke(channel.add, url);

export const registerAddHandlerFromMain = (
    onAddSource: typeof invokeAddFromRenderer
) =>
    ipcMain.handle(
        channel.add,
        (_event, ...args: Parameters<typeof invokeAddFromRenderer>) =>
            onAddSource(...args)
    );

// Remove
export const invokeRemoveFromRenderer = (name: string): Promise<void> =>
    ipcRenderer.invoke(channel.remove, name);

export const registerRemoveHandlerFromMain = (
    onRemoveSource: typeof invokeRemoveFromRenderer
) =>
    ipcMain.handle(
        channel.remove,
        (_event, ...args: Parameters<typeof invokeRemoveFromRenderer>) =>
            onRemoveSource(...args)
    );
