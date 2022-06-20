/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { BrowserWindow } from 'electron';

export const registerLauncherWindowFromMain: (
    newLauncherWindow: BrowserWindow
) => void;

export const sendToLauncherWindowFromMain: (
    channel: string,
    ...args: unknown[]
) => void;
