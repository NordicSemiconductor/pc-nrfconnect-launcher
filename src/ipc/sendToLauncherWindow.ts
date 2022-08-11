/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { BrowserWindow } from 'electron';

let launcherWindow: BrowserWindow;

export const registerLauncherWindowFromMain = (window: BrowserWindow) => {
    launcherWindow = window;
};

export const sendToLauncherWindowFromMain = (
    channel: string,
    ...args: unknown[]
) => launcherWindow.webContents.send(channel, ...args);
