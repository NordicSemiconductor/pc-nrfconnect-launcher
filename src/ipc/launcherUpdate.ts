/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    handle,
    invoke,
    on,
    send,
} from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/infrastructure/rendererToMain';

const channel = {
    checkForUpdate: 'launcher-update:check',
    startUpdate: 'launcher-update:start',
    cancelUpdate: 'launcher-update:cancel',
    setUseChineseUpdateServer: 'launcher-update:set-use-chinese-update-server',
};

// Check
type CheckForUpdate = () => {
    isUpdateAvailable: boolean;
    newVersion: string;
};

const checkForUpdate = invoke<CheckForUpdate>(channel.checkForUpdate);
const registerCheckForUpdate = handle<CheckForUpdate>(channel.checkForUpdate);

// Start
type StartUpdate = () => void;

const startUpdate = send<StartUpdate>(channel.startUpdate);
const registerStartUpdate = on<StartUpdate>(channel.startUpdate);

// Cancel
type CancelUpdate = () => void;

const cancelUpdate = send<CancelUpdate>(channel.cancelUpdate);
const registerCancelUpdate = on<CancelUpdate>(channel.cancelUpdate);

// Set use Chinese update server
type SetUseChineseUpdateServer = (useChineseServer: boolean) => void;
const setUseChineseUpdateServer = send<SetUseChineseUpdateServer>(
    channel.setUseChineseUpdateServer
);
const registerSetUseChineseUpdateServer = on<SetUseChineseUpdateServer>(
    channel.setUseChineseUpdateServer
);

export const forRenderer = {
    registerCheckForUpdate,
    registerStartUpdate,
    registerCancelUpdate,
    registerSetUseChineseUpdateServer,
};
export const inMain = {
    checkForUpdate,
    startUpdate,
    cancelUpdate,
    setUseChineseUpdateServer,
};
