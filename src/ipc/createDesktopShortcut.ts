/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { LaunchableApp } from './apps';
import * as rendererToMain from './infrastructure/rendererToMain';

const channel = 'create-desktop-shortcut';

type CreateDesktopShortcut = (app: LaunchableApp) => void;

export const sendFromRenderer =
    rendererToMain.send<CreateDesktopShortcut>(channel);

export const registerHandlerFromMain =
    rendererToMain.registerSent<CreateDesktopShortcut>(channel);
