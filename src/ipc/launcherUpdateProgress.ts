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

export const updateStarted = send<UpdateStarted>(channel.started);
export const registerUpdateStarted = on<UpdateStarted>(channel.started);

// Progress
type UpdateProgress = (percentage: number) => void;

export const updateProgress = send<UpdateProgress>(channel.progress);
export const registerUpdateProgress = on<UpdateProgress>(channel.progress);

// Update finished
type UpdateFinished = (isSuccessful: boolean) => void;

export const updateFinished = send<UpdateFinished>(channel.finished);
export const registerUpdateFinished = on<UpdateFinished>(channel.finished);
