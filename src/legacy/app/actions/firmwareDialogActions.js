/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/**
 * Indicates that the FirmwareDialog should be shown, which asks the user if
 * the firmware for the given port should be updated. Apps will typically
 * dispatch this action to show the FirmwareDialog to the user.
 *
 * @param {Object} port Serial port object, ref. the serialport library.
 */
export const FIRMWARE_DIALOG_SHOW = 'FIRMWARE_DIALOG_SHOW';

/**
 * Indicates that the FirmwareDialog should be hidden. Apps will typically
 * dispatch this action to hide the FirmwareDialog after a firmware update
 * has completed or failed.
 */
export const FIRMWARE_DIALOG_HIDE = 'FIRMWARE_DIALOG_HIDE';

/**
 * Indicates that updating the firmware for the given port has been requested.
 *
 * Apps can listen to this action in middleware, and implement their own
 * firmware update routine. This will typically involve calling pc-nrfjprog-js
 * with the firmware that the app requires.
 *
 * @param {Object} port Serial port object, ref. the serialport library.
 */
export const FIRMWARE_DIALOG_UPDATE_REQUESTED =
    'FIRMWARE_DIALOG_UPDATE_REQUESTED';

export function showDialog(port) {
    return {
        type: FIRMWARE_DIALOG_SHOW,
        port,
    };
}

export function hideDialog() {
    return {
        type: FIRMWARE_DIALOG_HIDE,
    };
}

export function firmwareUpdateRequested(port) {
    return {
        type: FIRMWARE_DIALOG_UPDATE_REQUESTED,
        port,
    };
}
