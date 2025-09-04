/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { JLinkUpdate } from '@nordicsemiconductor/nrf-jlink-js';
import {
    on,
    send,
} from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/infrastructure/mainToRenderer';
import {
    handle,
    invoke,
} from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/infrastructure/rendererToMain';

const startJLinkInstallChannel = 'start-install-jlink';

type StartJLinkInstall = (offlineInstall?: boolean) => void;

const startJLinkInstall = invoke<StartJLinkInstall>(startJLinkInstallChannel);
const registerStartJLinkInstall = handle<StartJLinkInstall>(
    startJLinkInstallChannel
);

const jlinkUpdateProgressChannel = 'jlink-update-progress';

type UpdateJLinkProgress = (update: JLinkUpdate) => void;

const updateJLinkProgress = send<UpdateJLinkProgress>(
    jlinkUpdateProgressChannel
);
const registerUpdateJLinkProgress = on<UpdateJLinkProgress>(
    jlinkUpdateProgressChannel
);

export const forMain = {
    registerUpdateJLinkProgress,
};
export const inRenderer = { updateJLinkProgress };
export const forRenderer = {
    registerStartJLinkInstall,
};
export const inMain = { startJLinkInstall };
