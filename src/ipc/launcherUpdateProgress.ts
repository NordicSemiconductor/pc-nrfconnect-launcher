/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ipcRenderer } from 'electron';

import { sendToLauncherWindowFromMain } from './sendToLauncherWindow';

const channel = {
    started: 'launcher-update:started',
    progress: 'launcher-update:progress',
    finished: 'launcher-update:finished',
};

// Start update
export const sendUpdateStartedFromMain = () =>
    sendToLauncherWindowFromMain(channel.started);

export const registerUpdateStartedHandlerFromRenderer = (
    onLauncherUpdateStarted: typeof sendUpdateStartedFromMain
) => ipcRenderer.on(channel.started, onLauncherUpdateStarted);

// Progress
export const sendUpdateProgressFromMain = (percentage: number) =>
    sendToLauncherWindowFromMain(channel.progress, percentage);

export const registerUpdateProgressHandlerFromRenderer = (
    onLauncherUpdateProgress: typeof sendUpdateProgressFromMain
) =>
    ipcRenderer.on(channel.progress, (_event, percentage) =>
        onLauncherUpdateProgress(percentage)
    );

// Update finished
export const sendUpdateFinishedFromMain = (isSuccessful: boolean) =>
    sendToLauncherWindowFromMain(channel.finished, isSuccessful);

export const registerUpdateFinishedHandlerFromRenderer = (
    onLauncherUpdateFinished: typeof sendUpdateFinishedFromMain
) =>
    ipcRenderer.on(channel.finished, (_event, isSuccessful) =>
        onLauncherUpdateFinished(isSuccessful)
    );
