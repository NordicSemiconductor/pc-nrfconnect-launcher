/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const registerHandlerFromMain: (
    onDownloadToFile: (url: string, filePath: string) => void
) => void;

export const invokeFromRenderer: (
    url: string,
    filePath: string
) => Promise<void>;
