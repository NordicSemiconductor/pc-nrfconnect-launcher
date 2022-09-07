/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ipcMain, ipcRenderer, powerSaveBlocker } from 'electron';

const channel = {
    start: 'prevent-sleep:start',
    end: 'prevent-sleep:end',
};

// Currently the functions to send these IPC messages are not called from
// anywhere, but we want to enable apps to prevent sleep, e.g.during long
// running operations. So this might change in the future.

// Start
export const invokeStartFromRenderer = (): Promise<number> =>
    ipcRenderer.invoke(channel.start);

export const registerStartHandlerFromMain = () =>
    ipcMain.handle(channel.start, () =>
        powerSaveBlocker.start('prevent-app-suspension')
    );

// End
export const sendEndFromRender = (id: number) =>
    ipcRenderer.send(channel.end, id);

export const registerEndHandlerFromMain = () =>
    ipcMain.on(channel.end, (_event, id: number) => powerSaveBlocker.stop(id));
