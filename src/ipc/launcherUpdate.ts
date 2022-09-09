/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { handle, invoke, on, send } from './infrastructure/rendererToMain';

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

export const invokeCheckForUpdateFromRenderer = invoke<CheckForUpdate>(
    channel.checkForUpdate
);

export const registerCheckForUpdateHandlerFromMain = handle<CheckForUpdate>(
    channel.checkForUpdate
);

// Start
type StartUpdate = () => void;

export const sendStartUpdateFromRender = send<StartUpdate>(channel.startUpdate);

export const registerStartUpdateHandlerFromMain = on<StartUpdate>(
    channel.startUpdate
);

// Cancel
type CancelUpdate = () => void;

export const sendCancelUpdateFromRender = send<CancelUpdate>(
    channel.cancelUpdate
);

export const registerCancelUpdateHandlerFromMain = on<CancelUpdate>(
    channel.cancelUpdate
);
