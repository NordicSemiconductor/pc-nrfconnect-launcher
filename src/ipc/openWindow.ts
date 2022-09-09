/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { LaunchableApp } from './apps';
import { on, send } from './infrastructure/rendererToMain';

const channel = {
    app: 'open:app',
    launcher: 'open-app-launcher', // It would be nice to call this `open:launcher` but we have to stick to the current name, because that is used by supported apps.
};

// open app
type OpenApp = (app: LaunchableApp) => void;

export const openApp = send<OpenApp>(channel.app);
export const registerOpenApp = on<OpenApp>(channel.app);

// open launcher

type OpenLauncher = () => void;

// Currently this functions to send this IPC message is not called from
// anywhere. We do send messages over the same IPC channel by using the
// corresponding name from some apps and we want to switch using this function
// in the future.
export const openLauncher = send<OpenLauncher>(channel.launcher);
export const registerOpenLauncher = on<OpenLauncher>(channel.launcher);
