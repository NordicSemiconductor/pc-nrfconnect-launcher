/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ipcMain, ipcRenderer } from 'electron';

const channel = {
    get: 'setting:get',
    set: 'setting:set',
};

// Get
export const registerGetHandlerFromMain = (
    onGetSetting: (settingKey: string, defaultValue?: unknown) => unknown
) =>
    ipcMain.handle(channel.get, (_event, settingKey, defaultValue) =>
        onGetSetting(settingKey, defaultValue)
    );

export const invokeGetFromRenderer = <T = unknown>(
    settingKey: string,
    defaultValue?: T
): Promise<T> => ipcRenderer.invoke(channel.get, settingKey, defaultValue);

// Set
export const registerSetHandlerFromMain = (
    onSetSetting: typeof sendSetFromRenderer
) => ipcMain.on(channel.set, (_event, key, value) => onSetSetting(key, value));

export const sendSetFromRenderer = (key: string, value: unknown) =>
    ipcRenderer.send(channel.set, key, value);
