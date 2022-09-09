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

export const checkForUpdate = invoke<CheckForUpdate>(channel.checkForUpdate);
export const registerCheckForUpdate = handle<CheckForUpdate>(
    channel.checkForUpdate
);

// Start
type StartUpdate = () => void;

export const startUpdate = send<StartUpdate>(channel.startUpdate);
export const registerStartUpdate = on<StartUpdate>(channel.startUpdate);

// Cancel
type CancelUpdate = () => void;

export const cancelUpdate = send<CancelUpdate>(channel.cancelUpdate);
export const registerCancelUpdate = on<CancelUpdate>(channel.cancelUpdate);
