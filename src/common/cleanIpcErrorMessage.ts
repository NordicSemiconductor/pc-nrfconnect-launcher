/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export default (message: string, replacecment = '') =>
    message.replace(
        /Error invoking remote method '.*?': *(Error:)? */,
        replacecment
    );
