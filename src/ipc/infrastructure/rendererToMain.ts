/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ipcMain, ipcRenderer } from 'electron';

// Send
export const send =
    <T extends (...args: any[]) => void>( // eslint-disable-line @typescript-eslint/no-explicit-any -- We have to explicitly allow any function here
        channel: string
    ) =>
    (...args: Parameters<T>) =>
        ipcRenderer.send(channel, ...args);

export const on =
    <T extends (...args: any[]) => void>( // eslint-disable-line @typescript-eslint/no-explicit-any -- We have to explicitly allow any function here
        channel: string
    ) =>
    (handler: T) =>
        ipcMain.on(channel, (_event, ...args: unknown[]) =>
            handler(...(args as Parameters<T>))
        );

// Invoke
export const invoke =
    <T extends (...args: any[]) => any>( // eslint-disable-line @typescript-eslint/no-explicit-any -- We have to explicitly allow any function here
        channel: string
    ) =>
    (...args: Parameters<T>) =>
        ipcRenderer.invoke(channel, ...args) as Promise<ReturnType<T>>;

export const handle =
    <T extends (...args: any[]) => any>( // eslint-disable-line @typescript-eslint/no-explicit-any -- We have to explicitly allow any function here
        channel: string
    ) =>
    (
        handler:
            | ((...args: Parameters<T>) => ReturnType<T>)
            | ((...args: Parameters<T>) => Promise<ReturnType<T>>)
    ) =>
        ipcMain.handle(channel, (_event, ...args: unknown[]) =>
            handler(...(args as Parameters<T>))
        );
