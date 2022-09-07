/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

interface LauncherUpdateCheckResult {
    isUpdateAvailable: boolean;
    newVersion: string;
}

export const registerCheckForUpdateHandlerFromMain: (
    onCheckForUpdate: () => Promise<LauncherUpdateCheckResult>
) => void;

export const registerStartUpdateHandlerFromMain: (
    onStartUpdate: () => void
) => void;

export const registerCancelUpdateHandlerFromMain: (
    onCancelUpdate: () => void
) => void;

export const invokeCheckForUpdateFromRenderer: () => Promise<LauncherUpdateCheckResult>;
export const sendStartUpdateFromRender: () => void;
export const sendCancelUpdateFromRender: () => void;
