/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ipcRenderer } from 'electron';

import { sendToLauncherWindowFromMain } from './sendToLauncherWindow';

interface Progress {
    name: string;
    source: string;
    progressFraction: number;
}

const channel = 'download-progress';

export const registerHandlerFromRenderer = (
    onDownloadProgress: typeof sendFromMain
) =>
    ipcRenderer.on(channel, (_event, progress) => onDownloadProgress(progress));

export const sendFromMain = (progress: Progress) =>
    sendToLauncherWindowFromMain(channel, progress);
