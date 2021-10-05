/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const ERROR_DIALOG_SHOW = 'ERROR_DIALOG_SHOW';
export const ERROR_DIALOG_HIDE = 'ERROR_DIALOG_HIDE';

export function showDialog(message) {
    return {
        type: ERROR_DIALOG_SHOW,
        message,
    };
}

export function hideDialog() {
    return {
        type: ERROR_DIALOG_HIDE,
    };
}
