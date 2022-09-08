/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ipcMain, ipcRenderer } from 'electron';

import { LaunchableApp } from './apps';

const channel = {
    app: 'open:app',
    launcher: 'open:launcher',
};

// open app
export const sendOpenAppFromRender = (app: LaunchableApp) =>
    ipcRenderer.send(channel.app, app);

export const registerOpenAppHandlerFromMain = (
    onOpenApp: typeof sendOpenAppFromRender
) =>
    ipcMain.on(
        channel.app,
        (_event, ...args: Parameters<typeof sendOpenAppFromRender>) =>
            onOpenApp(...args)
    );

// open launcher

// Currently this functions to send this IPC message is not called from
// anywhere. We do send messages over the same IPC channel by using the
// corresponding name from some apps and we want to switch using this function
// in the future.
export const sendOpenLauncherFromRender = () =>
    ipcRenderer.send(channel.launcher);

export const registerOpenLauncherHandlerFromMain = (
    onOpenLauncher: typeof sendOpenLauncherFromRender
) => ipcMain.on(channel.launcher, onOpenLauncher);
