/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { on, send } from './infrastructure/mainToRenderer';

const channel = 'download-progress';

type DownloadProgress = (progress: {
    name: string;
    source: string;
    progressFraction: number;
}) => void;

export const sendFromMain = send<DownloadProgress>(channel);

export const registerHandlerFromRenderer = on<DownloadProgress>(channel);
