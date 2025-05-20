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

const channel = {
    start: 'app-install:start',
    progress: 'app-install:progress',
};

// Start
type StartAppInstall = (app: AppSpec, fractionNames: string[]) => void;

const reportAppInstallStart = send<StartAppInstall>(channel.start);
const registerAppInstallStart = on<StartAppInstall>(channel.start);

// Progress
export type Progress = {
    app: AppSpec;
    progressFraction: number;
    fractionName: string;
};

type DownloadProgress = (progress: Progress) => void;

const reportAppInstallProgress = send<DownloadProgress>(channel.progress);
const registerAppInstallProgress = on<DownloadProgress>(channel.progress);

export const forMain = { registerAppInstallStart, registerAppInstallProgress };
export const inRenderer = { reportAppInstallStart, reportAppInstallProgress };
