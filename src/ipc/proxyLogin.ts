/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { AuthInfo, ipcMain, ipcRenderer } from 'electron';

import { sendToLauncherWindowFromMain } from './sendToLauncherWindow';

const channel = {
    request: 'proxy-login:request',
    response: 'proxy-login:response',
};

// Request Proxy Login
export const sendFromMain = (requestId: string, authInfo: AuthInfo) =>
    sendToLauncherWindowFromMain(channel.request, requestId, authInfo);

export const registerHandlerFromRenderer = (
    onProxyLogin: typeof sendFromMain
) =>
    ipcRenderer.on(
        channel.request,
        (_event, ...args: Parameters<typeof sendFromMain>) =>
            onProxyLogin(...args)
    );

// Respond to Proxy Login Request
export const sendFromRenderer = (
    requestId: string,
    username?: string,
    password?: string
) => ipcRenderer.send(channel.response, requestId, username, password);

export const registerHandlerFromMain = (
    onProxyLoginCredentials: typeof sendFromRenderer
) =>
    ipcMain.on(
        channel.response,
        (_event, ...args: Parameters<typeof sendFromRenderer>) =>
            onProxyLoginCredentials(...args)
    );
