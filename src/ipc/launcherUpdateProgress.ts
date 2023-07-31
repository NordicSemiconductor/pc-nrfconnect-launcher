/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    on,
    send,
} from 'pc-nrfconnect-shared/ipc/infrastructure/mainToRenderer';

const channel = {
    started: 'launcher-update:started',
    progress: 'launcher-update:progress',
    finished: 'launcher-update:finished',
};

// Update started
type UpdateStarted = () => void;

const updateStarted = send<UpdateStarted>(channel.started);
const registerUpdateStarted = on<UpdateStarted>(channel.started);

// Progress
type UpdateProgress = (percentage: number) => void;

const updateProgress = send<UpdateProgress>(channel.progress);
const registerUpdateProgress = on<UpdateProgress>(channel.progress);

// Update finished
type UpdateFinished = (isSuccessful: boolean) => void;

const updateFinished = send<UpdateFinished>(channel.finished);
const registerUpdateFinished = on<UpdateFinished>(channel.finished);

export const forMain = {
    registerUpdateStarted,
    registerUpdateProgress,
    registerUpdateFinished,
};
export const inRenderer = {
    updateStarted,
    updateProgress,
    updateFinished,
};
