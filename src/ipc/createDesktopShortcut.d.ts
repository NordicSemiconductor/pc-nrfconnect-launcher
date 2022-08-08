/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { LaunchableApp } from './apps';

export const registerHandlerFromMain: (
    onCreateDesktopShortcut: (app: LaunchableApp) => void
) => void;

export const sendFromRenderer: (app: LaunchableApp) => void;
