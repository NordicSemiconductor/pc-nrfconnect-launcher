/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// Get
export const registerGetHandlerFromMain: (
    onGetSetting: (settingKey: string, defaultValue: unknown) => unknown
) => void;

export const invokeGetFromRenderer: <T = unknown>(
    settingKey: string,
    defaultValue?: T
) => Promise<T>;

// Set
export const registerSetHandlerFromMain: (
    onSetSetting: (settingKey: string, value: unknown) => void
) => void;

export const sendSetFromRenderer: (settingKey: string, value: unknown) => void;
