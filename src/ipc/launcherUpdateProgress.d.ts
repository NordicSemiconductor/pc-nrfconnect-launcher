/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// Start update
export const registerUpdateStartedHandlerFromRenderer: (
    onLauncherUpdateStarted: () => void
) => void;

export const sendUpdateStartedFromMain: () => void;

// Progress
export const registerUpdateProgressHandlerFromRenderer: (
    onLauncherUpdateProgress: (percentage: number) => void
) => void;

export const sendUpdateProgressFromMain: (percentage: number) => void;

// Update finished
export const registerUpdateFinishedHandlerFromRenderer: (
    onLauncherUpdateFinished: (isSuccessful: boolean) => void
) => void;

export const sendUpdateFinishedFromMain: (isSuccessful: boolean) => void;
