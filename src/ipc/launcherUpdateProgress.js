/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const { ipcRenderer } = require('electron');
const { sendToLauncherWindowFromMain } = require('./sendToLauncherWindow');

const channel = {
    started: 'launcher-update:started',
    progress: 'launcher-update:progress',
    finished: 'launcher-update:finished',
};

// Start update
const registerUpdateStartedHandlerFromRenderer = onLauncherUpdateStarted =>
    ipcRenderer.on(channel.started, onLauncherUpdateStarted);

const sendUpdateStartedFromMain = () =>
    sendToLauncherWindowFromMain(channel.started);

// Progress
const registerUpdateProgressHandlerFromRenderer = onLauncherUpdateProgress =>
    ipcRenderer.on(channel.progress, (_event, percentage) =>
        onLauncherUpdateProgress(percentage)
    );

const sendUpdateProgressFromMain = percentage =>
    sendToLauncherWindowFromMain(channel.progress, percentage);

// Update finished
const registerUpdateFinishedHandlerFromRenderer = onLauncherUpdateFinished =>
    ipcRenderer.on(channel.finished, (_event, isSuccessful) =>
        onLauncherUpdateFinished(isSuccessful)
    );

const sendUpdateFinishedFromMain = isSuccessful =>
    sendToLauncherWindowFromMain(channel.finished, isSuccessful);

module.exports = {
    registerUpdateStartedHandlerFromRenderer,
    registerUpdateProgressHandlerFromRenderer,
    registerUpdateFinishedHandlerFromRenderer,
    sendUpdateStartedFromMain,
    sendUpdateProgressFromMain,
    sendUpdateFinishedFromMain,
};
