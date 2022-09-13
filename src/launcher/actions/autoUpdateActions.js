/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const AUTO_UPDATE_AVAILABLE = 'AUTO_UPDATE_AVAILABLE';
export const AUTO_UPDATE_START_DOWNLOAD = 'AUTO_UPDATE_START_DOWNLOAD';
export const AUTO_UPDATE_CANCEL_DOWNLOAD = 'AUTO_UPDATE_CANCEL_DOWNLOAD';
export const AUTO_UPDATE_DOWNLOADING = 'AUTO_UPDATE_DOWNLOADING';
export const AUTO_UPDATE_RESET = 'AUTO_UPDATE_RESET';

const isWindows = process.platform === 'win32';
const isMac = process.platform === 'darwin';

export function updateAvailableAction(version) {
    return {
        type: AUTO_UPDATE_AVAILABLE,
        version,
    };
}

export function startDownloadAction(
    isProgressSupported = isWindows || isMac,
    isCancelSupported = isWindows
) {
    return {
        type: AUTO_UPDATE_START_DOWNLOAD,
        isProgressSupported,
        isCancelSupported,
    };
}

export function cancelDownloadAction() {
    return {
        type: AUTO_UPDATE_CANCEL_DOWNLOAD,
    };
}

export function updateDownloadingAction(percentDownloaded) {
    return {
        type: AUTO_UPDATE_DOWNLOADING,
        percentDownloaded,
    };
}

export function resetAction(error) {
    return {
        type: AUTO_UPDATE_RESET,
        error,
    };
}
