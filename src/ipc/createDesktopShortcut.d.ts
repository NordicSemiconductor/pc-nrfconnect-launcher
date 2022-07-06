/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { App } from './apps';

export const registerHandlerFromMain: (
    onCreateDesktopShortcut: (app: App) => void
) => void;

export const sendFromRenderer: (app: App) => void;
