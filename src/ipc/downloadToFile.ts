/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ipcMain, ipcRenderer } from 'electron';

const channel = 'download-to-file';

export const invokeFromRenderer = (
    url: string,
    filePath: string
): Promise<void> => ipcRenderer.invoke(channel, url, filePath);

type HandlerParameters = [
    ...Parameters<typeof invokeFromRenderer>,
    boolean | undefined
];
type Handler = (
    ...args: HandlerParameters
) => ReturnType<typeof invokeFromRenderer>;

export const registerHandlerFromMain = (onDownloadToFile: Handler) =>
    ipcMain.handle(channel, (_event, url, filePath) =>
        onDownloadToFile(url, filePath, false)
    );
