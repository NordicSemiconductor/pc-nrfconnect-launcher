/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ipcMain, ipcRenderer, WebContents } from 'electron';

import { LaunchableApp } from './apps';

const channel = {
    request: 'get-app-details',
    response: 'app-details',
};

export type AppDetails = LaunchableApp & {
    coreVersion: string;
    corePath: string;
    homeDir: string;
    tmpDir: string;
    bundledJlink: string;
};

// Currently the function to send this IPC message is not called from
// anywhere, but the same IPC message is sent from apps.
export const sendFromRenderer = () => ipcRenderer.send(channel.request);

export const registerHandlerFromMain = (
    getAppDetails: (webContents: WebContents) => AppDetails
) =>
    ipcMain.on(channel.request, event => {
        event.sender.send(channel.response, getAppDetails(event.sender));
    });
