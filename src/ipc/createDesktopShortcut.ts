/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ipcMain, ipcRenderer } from 'electron';

import { LaunchableApp } from './apps';

const channel = 'create-desktop-shortcut';

export const sendFromRenderer = (app: LaunchableApp) =>
    ipcRenderer.send(channel, app);

export const registerHandlerFromMain = (
    onCreateDesktopShortcut: typeof sendFromRenderer
) =>
    ipcMain.on(
        channel,
        (_event, ...args: Parameters<typeof sendFromRenderer>) =>
            onCreateDesktopShortcut(...args)
    );