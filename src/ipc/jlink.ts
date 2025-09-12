/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { JLinkState } from '@nordicsemiconductor/nrf-jlink-js';
import {
    handle,
    invoke,
} from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/infrastructure/rendererToMain';

const channel = {
    getState: 'jlink:get-state',
    start: 'jlink:start',
};

type GetJLinkState = (options: { checkOnline: boolean }) => JLinkState;
const getJLinkState = invoke<GetJLinkState>(channel.getState);
const registerGetJLinkState = handle<GetJLinkState>(channel.getState);

type InstallJLink = (offlineInstall?: boolean) => void;
const installJLink = invoke<InstallJLink>(channel.start);
const registerInstallJLink = handle<InstallJLink>(channel.start);

export const forRenderer = { registerGetJLinkState, registerInstallJLink };
export const inMain = { getJLinkState, installJLink };
