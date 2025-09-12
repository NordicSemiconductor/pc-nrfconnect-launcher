/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    handle,
    invoke,
} from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/infrastructure/rendererToMain';

const channel = 'jlink:install';

type InstallJLink = (offlineInstall?: boolean) => void;

const installJLink = invoke<InstallJLink>(channel);
const registerInstallJLink = handle<InstallJLink>(channel);

export const forRenderer = { registerInstallJLink };
export const inMain = { installJLink };
