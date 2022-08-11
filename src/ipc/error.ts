/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const cleanIpcErrorMessage = (message: string, replacecment = '') =>
    message.replace(
        /Error invoking remote method '.*?': *(Error:)? */,
        replacecment
    );
