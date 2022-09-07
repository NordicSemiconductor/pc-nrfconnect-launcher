/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const registerHandlerFromRenderer: (
    onShowErrorDialog: (errorMessage: string) => void
) => void;

export const sendFromMain: (errorMessage: string) => void;
