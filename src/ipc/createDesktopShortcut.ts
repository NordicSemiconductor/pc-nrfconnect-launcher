/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { LaunchableApp } from './apps';
import { on, send } from './infrastructure/rendererToMain';

const channel = 'create-desktop-shortcut';

type CreateDesktopShortcut = (app: LaunchableApp) => void;

export const createDesktopShortcut = send<CreateDesktopShortcut>(channel);
export const registerCreateDesktopShortcut = on<CreateDesktopShortcut>(channel);
