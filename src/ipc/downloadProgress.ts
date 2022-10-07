/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { AppSpec } from './apps';
import { on, send } from './infrastructure/mainToRenderer';

const channel = 'download-progress';

export type Progress = {
    app: AppSpec;
    progressFraction: number;
};

type DownloadProgress = (progress: Progress) => void;

export const downloadProgress = send<DownloadProgress>(channel);
export const registerDownloadProgress = on<DownloadProgress>(channel);
