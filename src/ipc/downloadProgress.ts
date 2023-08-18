/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    on,
    send,
} from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/infrastructure/mainToRenderer';

import { AppSpec } from './apps';

const channel = 'download-progress';

export type Progress = {
    app: AppSpec;
    progressFraction: number;
};

type DownloadProgress = (progress: Progress) => void;

const reportDownloadProgress = send<DownloadProgress>(channel);
const registerDownloadProgress = on<DownloadProgress>(channel);

export const forMain = { registerDownloadProgress };
export const inRenderer = { reportDownloadProgress };
