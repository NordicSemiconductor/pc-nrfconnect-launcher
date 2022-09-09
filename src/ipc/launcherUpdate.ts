/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as rendererToMain from './infrastructure/rendererToMain';

const channel = {
    checkForUpdate: 'launcher-update:check',
    startUpdate: 'launcher-update:start',
    cancelUpdate: 'launcher-update:cancel',
};

// Check
type CheckForUpdate = () => {
    isUpdateAvailable: boolean;
    newVersion: string;
};

export const invokeCheckForUpdateFromRenderer =
    rendererToMain.invoke<CheckForUpdate>(channel.checkForUpdate);

export const registerCheckForUpdateHandlerFromMain =
    rendererToMain.handle<CheckForUpdate>(channel.checkForUpdate);

// Start
type StartUpdate = () => void;

export const sendStartUpdateFromRender = rendererToMain.send<StartUpdate>(
    channel.startUpdate
);

export const registerStartUpdateHandlerFromMain =
    rendererToMain.on<StartUpdate>(channel.startUpdate);

// Cancel
type CancelUpdate = () => void;

export const sendCancelUpdateFromRender = rendererToMain.send<CancelUpdate>(
    channel.cancelUpdate
);

export const registerCancelUpdateHandlerFromMain =
    rendererToMain.on<CancelUpdate>(channel.cancelUpdate);
