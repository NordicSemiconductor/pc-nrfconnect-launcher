/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ipcMain, ipcRenderer } from 'electron';

const channel = 'download-to-file';

export const registerHandlerFromMain = (
    onDownloadToFile: (
        url: string,
        filePath: string,
        enableProxyLogin?: boolean
    ) => Promise<void>
) =>
    ipcMain.handle(channel, (_event, url, filePath) =>
        onDownloadToFile(url, filePath, false)
    );

export const invokeFromRenderer = (
    url: string,
    filePath: string
): Promise<void> => ipcRenderer.invoke(channel, url, filePath);
