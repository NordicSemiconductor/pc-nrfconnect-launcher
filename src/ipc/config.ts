/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ipcMain, ipcRenderer } from 'electron';

export interface Configuration {
    isRunningLauncherFromSource: boolean;
    isSkipUpdateApps: boolean;
    isSkipUpdateLauncher: boolean;
    version: string;
}
const channel = 'get-config';

export const getConfig = (): Configuration => ipcRenderer.sendSync(channel);

export const registerGetConfig = (config: Configuration) =>
    ipcMain.on(channel, event => {
        event.returnValue = config;
    });
