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

// Currently this functions to send this IPC messages is not called from
// anywhere, but we want to start using it in apps.
export const invokeFromRenderer = (): Promise<AppDetails> =>
    ipcRenderer.invoke(channel.request);

// This is just a legacy function. Apps still use this IPC channel, even
// though they do not use this function.
export const sendFromRenderer = () => ipcRenderer.send(channel.request);

export const registerHandlerFromMain = (
    getAppDetails: (webContents: WebContents) => AppDetails
) => {
    ipcMain.handle(
        channel.request,
        (event): AppDetails => getAppDetails(event.sender)
    );

    // This legacy implementation is still needed, because we currently still
    // send the corresponding message in apps.
    ipcMain.on(channel.request, event => {
        event.sender.send(channel.response, getAppDetails(event.sender));
    });
};
