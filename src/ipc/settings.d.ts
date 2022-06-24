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

// GetSources
export const registerGetSourcesHandlerFromMain: (
    onGetSourcesSetting: () => Record<string, string>
) => void;

export const invokeGetSourcesFromRenderer: () => Promise<
    Record<string, string>
>;

// Set
export const registerSetHandlerFromMain: (
    onSetSetting: (settingKey: string, value: unknown) => void
) => void;

export const sendSetFromRenderer: (settingKey: string, value: unknown) => void;

// SetSources
export const registerSetSourcesHandlerFromMain: (
    onSetSourcesSetting: (sources: Record<string, string>) => void
) => void;

export const sendSetSourcesFromRenderer: (
    sources: Record<string, string>
) => void;
