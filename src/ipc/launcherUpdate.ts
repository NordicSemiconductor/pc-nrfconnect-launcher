/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ipcMain, ipcRenderer } from 'electron';

interface LauncherUpdateCheckResult {
    isUpdateAvailable: boolean;
    newVersion: string;
}

const channel = {
    checkForUpdate: 'launcher-update:check',
    startUpdate: 'launcher-update:start',
    cancelUpdate: 'launcher-update:cancel',
};

// Check

export const registerCheckForUpdateHandlerFromMain = (
    onCheckForUpdate: typeof invokeCheckForUpdateFromRenderer
) => ipcMain.handle(channel.checkForUpdate, onCheckForUpdate);

export const invokeCheckForUpdateFromRenderer =
    (): Promise<LauncherUpdateCheckResult> =>
        ipcRenderer.invoke(channel.checkForUpdate);

// Start

export const registerStartUpdateHandlerFromMain = (
    onStartUpdate: typeof sendStartUpdateFromRender
) => ipcMain.on(channel.startUpdate, onStartUpdate);

export const sendStartUpdateFromRender = () =>
    ipcRenderer.send(channel.startUpdate);

// Cancel

export const registerCancelUpdateHandlerFromMain = (
    onCancelUpdate: typeof sendCancelUpdateFromRender
) => ipcMain.on(channel.cancelUpdate, onCancelUpdate);

export const sendCancelUpdateFromRender = () =>
    ipcRenderer.send(channel.cancelUpdate);
