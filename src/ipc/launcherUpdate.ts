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
    rendererToMain.registerInvoked<CheckForUpdate>(channel.checkForUpdate);

// Start
type StartUpdate = () => void;

export const sendStartUpdateFromRender = rendererToMain.send<StartUpdate>(
    channel.startUpdate
);

export const registerStartUpdateHandlerFromMain =
    rendererToMain.registerSent<StartUpdate>(channel.startUpdate);

// Cancel
type CancelUpdate = () => void;

export const sendCancelUpdateFromRender = rendererToMain.send<CancelUpdate>(
    channel.cancelUpdate
);

export const registerCancelUpdateHandlerFromMain =
    rendererToMain.registerSent<CancelUpdate>(channel.cancelUpdate);
