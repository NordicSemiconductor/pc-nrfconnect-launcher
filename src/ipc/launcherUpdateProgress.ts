/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { on, send } from './infrastructure/mainToRenderer';

const channel = {
    started: 'launcher-update:started',
    progress: 'launcher-update:progress',
    finished: 'launcher-update:finished',
};

// Update started
type UpdateStarted = () => void;

export const sendUpdateStartedFromMain = send<UpdateStarted>(channel.started);

export const registerUpdateStartedHandlerFromRenderer = on<UpdateStarted>(
    channel.started
);

// Progress
type UpdateProgress = (percentage: number) => void;

export const sendUpdateProgressFromMain = send<UpdateProgress>(
    channel.progress
);

export const registerUpdateProgressHandlerFromRenderer = on<UpdateProgress>(
    channel.progress
);

// Update finished
type UpdateFinished = (isSuccessful: boolean) => void;

export const sendUpdateFinishedFromMain = send<UpdateFinished>(
    channel.finished
);

export const registerUpdateFinishedHandlerFromRenderer = on<UpdateFinished>(
    channel.finished
);
