/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ErrorDialogActions, logger } from 'pc-nrfconnect-shared';

import { downloadAllAppsJsonFiles } from '../../ipc/apps';
import { cancelUpdate, checkForUpdate } from '../../ipc/launcherUpdate';
import * as AppsActions from './appsActions';
import * as SettingsActions from './settingsActions';

export const AUTO_UPDATE_AVAILABLE = 'AUTO_UPDATE_AVAILABLE';
export const AUTO_UPDATE_START_DOWNLOAD = 'AUTO_UPDATE_START_DOWNLOAD';
export const AUTO_UPDATE_CANCEL_DOWNLOAD = 'AUTO_UPDATE_CANCEL_DOWNLOAD';
export const AUTO_UPDATE_DOWNLOADING = 'AUTO_UPDATE_DOWNLOADING';
export const AUTO_UPDATE_RESET = 'AUTO_UPDATE_RESET';

const isWindows = process.platform === 'win32';
const isMac = process.platform === 'darwin';

function updateAvailableAction(version) {
    return {
        type: AUTO_UPDATE_AVAILABLE,
        version,
    };
}

export function startDownloadAction() {
    return {
        type: AUTO_UPDATE_START_DOWNLOAD,
        isProgressSupported: isWindows || isMac,
        isCancelSupported: isWindows,
    };
}

function cancelDownloadAction() {
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

export function checkForCoreUpdates() {
    return async dispatch => {
        try {
            const { isUpdateAvailable, newVersion } = await checkForUpdate();

            if (isUpdateAvailable) {
                dispatch(updateAvailableAction(newVersion));
            } else {
                dispatch(resetAction());
            }
        } catch (error) {
            logger.warn(error);
        }
    };
}

export function cancelDownload() {
    return dispatch => {
        cancelUpdate();
        dispatch(cancelDownloadAction());
    };
}

export function downloadLatestAppInfo(options = { rejectIfError: false }) {
    return dispatch => {
        dispatch(AppsActions.downloadLatestAppInfoAction());

        return downloadAllAppsJsonFiles()
            .then(() =>
                dispatch(AppsActions.downloadLatestAppInfoSuccessAction())
            )
            .catch(error => {
                dispatch(AppsActions.downloadLatestAppInfoErrorAction());
                if (options.rejectIfError) {
                    throw error;
                } else if (error.sourceNotFound) {
                    dispatch(
                        ErrorDialogActions.showDialog(
                            `Unable to retrieve the source “${error.source.name}” from ${error.source.url}. \n\n` +
                                'This is usually caused by outdated app sources in the settings, ' +
                                'where the sources files was removed from the server.',
                            {
                                'Remove source': () => {
                                    dispatch(
                                        SettingsActions.removeSource(
                                            error.source.name
                                        )
                                    );
                                    dispatch(ErrorDialogActions.hideDialog());
                                },
                                Cancel: () => {
                                    dispatch(ErrorDialogActions.hideDialog());
                                },
                            }
                        )
                    );
                } else {
                    dispatch(
                        ErrorDialogActions.showDialog(
                            `Unable to download latest app info: ${error.message}`
                        )
                    );
                }
            });
    };
}

export function checkForUpdatesManually() {
    return dispatch =>
        dispatch(downloadLatestAppInfo({ rejectIfError: true }))
            .then(() => {
                dispatch(checkForCoreUpdates());
                dispatch(SettingsActions.showUpdateCheckCompleteDialog());
            })
            .catch(error =>
                dispatch(
                    ErrorDialogActions.showDialog(
                        `Unable to check for updates: ${error.message}`
                    )
                )
            );
}
