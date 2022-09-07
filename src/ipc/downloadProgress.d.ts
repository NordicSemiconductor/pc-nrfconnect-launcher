/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

interface Progress {
    name: string;
    source: string;
    progressFraction: number;
}

export const registerHandlerFromRenderer: (
    onProgress: (progress: Progress) => void
) => void;

export const sendFromMain: (progress: Progress) => void;
