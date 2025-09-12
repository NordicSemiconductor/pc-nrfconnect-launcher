/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type JLinkUpdate } from '@nordicsemiconductor/nrf-jlink-js';
import {
    on,
    send,
} from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/infrastructure/mainToRenderer';

const channel = 'jlink:progress';

type UpdateJLinkProgress = (update: JLinkUpdate) => void;

const updateJLinkProgress = send<UpdateJLinkProgress>(channel);
const registerUpdateJLinkProgress = on<UpdateJLinkProgress>(channel);

export const forMain = { registerUpdateJLinkProgress };
export const inRenderer = { updateJLinkProgress };
