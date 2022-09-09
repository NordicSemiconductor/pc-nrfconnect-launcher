/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { BrowserWindow, ipcRenderer } from 'electron';

let launcherWindow: BrowserWindow;

export const registerLauncherWindowFromMain = (window: BrowserWindow) => {
    launcherWindow = window;
};

export const send =
    <T extends (...args: any[]) => void>( // eslint-disable-line @typescript-eslint/no-explicit-any -- We have to explicitly allow any function here
        channel: string
    ) =>
    (...args: Parameters<T>) =>
        launcherWindow.webContents.send(channel, ...args);

export const on =
    <T extends (...args: any[]) => void>( // eslint-disable-line @typescript-eslint/no-explicit-any -- We have to explicitly allow any function here
        channel: string
    ) =>
    (handler: T) =>
        ipcRenderer.on(channel, (_event, ...args: unknown[]) =>
            handler(...(args as Parameters<T>))
        );
