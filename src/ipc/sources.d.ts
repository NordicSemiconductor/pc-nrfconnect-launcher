/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// Get
export const registerGetHandlerFromMain: (
    onGetSources: () => Record<string, string>
) => void;

export const invokeGetFromRenderer: () => Promise<Record<string, string>>;

// Add
export const registerAddHandlerFromMain: (
    onAddSource: (url: string) => Promise<string>
) => void;

export const invokeAddFromRenderer: (url: string) => Promise<string>;

// Remove
export const registerRemoveHandlerFromMain: (
    onRemoveSource: (name: string) => void
) => void;

export const invokeRemoveFromRenderer: (name: string) => Promise<void>;
