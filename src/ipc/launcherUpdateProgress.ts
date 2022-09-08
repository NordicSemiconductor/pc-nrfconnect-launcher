/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as mainToRenderer from './infrastructure/mainToRenderer';

const channel = {
    started: 'launcher-update:started',
    progress: 'launcher-update:progress',
    finished: 'launcher-update:finished',
};

// Update started
type UpdateStarted = () => void;

export const sendUpdateStartedFromMain = mainToRenderer.send<UpdateStarted>(
    channel.started
);

export const registerUpdateStartedHandlerFromRenderer =
    mainToRenderer.registerSent<UpdateStarted>(channel.started);

// Progress
type UpdateProgress = (percentage: number) => void;

export const sendUpdateProgressFromMain = mainToRenderer.send<UpdateProgress>(
    channel.progress
);

export const registerUpdateProgressHandlerFromRenderer =
    mainToRenderer.registerSent<UpdateProgress>(channel.progress);

// Update finished
type UpdateFinished = (isSuccessful: boolean) => void;

export const sendUpdateFinishedFromMain = mainToRenderer.send<UpdateFinished>(
    channel.finished
);

export const registerUpdateFinishedHandlerFromRenderer =
    mainToRenderer.registerSent<UpdateFinished>(channel.finished);
