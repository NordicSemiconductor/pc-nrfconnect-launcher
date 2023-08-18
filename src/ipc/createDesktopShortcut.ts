/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    on,
    send,
} from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/infrastructure/rendererToMain';

import { LaunchableApp } from './apps';

const channel = 'create-desktop-shortcut';

type CreateDesktopShortcut = (app: LaunchableApp) => void;

const createDesktopShortcut = send<CreateDesktopShortcut>(channel);
const registerCreateDesktopShortcut = on<CreateDesktopShortcut>(channel);

export const forRenderer = { registerCreateDesktopShortcut };
export const inMain = { createDesktopShortcut };
