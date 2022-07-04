/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
// @ts-check

const { ipcRenderer, ipcMain } = require('electron');
const { sendToLauncherWindowFromMain } = require('./sendToLauncherWindow');

const channel = {
    request: 'proxy-login:request',
    response: 'proxy-login:response',
};

// Request Proxy Login

const registerHandlerFromRenderer = onProxyLogin =>
    ipcRenderer.on(channel.request, (_event, requestId, authInfo) =>
        onProxyLogin(requestId, authInfo)
    );

const sendFromMain = (requestId, authInfo) =>
    sendToLauncherWindowFromMain(channel.request, requestId, authInfo);

// Respond to Proxy Login Request

const registerHandlerFromMain = onProxyLoginCredentials =>
    ipcMain.on(channel.response, (_event, requestId, username, password) =>
        onProxyLoginCredentials(requestId, username, password)
    );

const sendFromRenderer = (requestId, username, password) =>
    ipcRenderer.send(channel.response, requestId, username, password);

module.exports = {
    registerHandlerFromMain,
    registerHandlerFromRenderer,
    sendFromMain,
    sendFromRenderer,
};
