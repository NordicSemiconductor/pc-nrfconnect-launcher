/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/**
 * Indicates that the AppReloadDialog should be shown. Apps will typically
 * dispatch this action to show the AppReloadDialog after errors occur to
 * help user reloading the app in order to fix the issues.
 */
export const APP_RELOAD_DIALOG_SHOW = 'APP_RELOAD_DIALOG_SHOW';

/**
 * Indicates that the AppReloadDialog should be hidden. Apps will typically
 * dispatch this action to hide the AppReloadDialog after reloading the app
 * or being cancelled.
 */
export const APP_RELOAD_DIALOG_HIDE = 'APP_RELOAD_DIALOG_HIDE';

export function showDialog(message) {
    return {
        type: APP_RELOAD_DIALOG_SHOW,
        message,
    };
}

export function hideDialog() {
    return {
        type: APP_RELOAD_DIALOG_HIDE,
    };
}
