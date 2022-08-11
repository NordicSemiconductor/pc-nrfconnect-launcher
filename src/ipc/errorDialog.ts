/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ipcRenderer } from 'electron';

import { sendToLauncherWindowFromMain } from './sendToLauncherWindow';

const channel = 'show-error-dialog';

export const registerHandlerFromRenderer = (
    onShowErrorDialog: typeof sendFromMain
) =>
    ipcRenderer.on(channel, (_event, errorMessage) =>
        onShowErrorDialog(errorMessage)
    );

export const sendFromMain = (errorMessage: string) =>
    sendToLauncherWindowFromMain(channel, errorMessage);
