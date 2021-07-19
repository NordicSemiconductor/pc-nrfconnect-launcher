/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { remote } from 'electron';
import log from 'electron-log';
import { ErrorDialogActions } from 'pc-nrfconnect-shared';

import * as AppsActions from './appsActions';
import * as SettingsActions from './settingsActions';
import * as UsageDataActions from './usageDataActions';

export const AUTO_UPDATE_CHECK = 'AUTO_UPDATE_CHECK';
export const AUTO_UPDATE_AVAILABLE = 'AUTO_UPDATE_AVAILABLE';
export const AUTO_UPDATE_POSTPONE = 'AUTO_UPDATE_POSTPONE';
export const AUTO_UPDATE_START_DOWNLOAD = 'AUTO_UPDATE_START_DOWNLOAD';
export const AUTO_UPDATE_CANCEL_DOWNLOAD = 'AUTO_UPDATE_CANCEL_DOWNLOAD';
export const AUTO_UPDATE_DOWNLOAD_CANCELLED = 'AUTO_UPDATE_DOWNLOAD_CANCELLED';
export const AUTO_UPDATE_DOWNLOADING = 'AUTO_UPDATE_DOWNLOADING';
export const AUTO_UPDATE_ERROR = 'AUTO_UPDATE_ERROR';

const mainApps = remote.require('../main/apps');
const { autoUpdater, CancellationToken } = remote.require('../main/autoUpdate');

const isWindows = process.platform === 'win32';
const isMac = process.platform === 'darwin';

// This is set and given to electron-updater when starting to download an
// application update. Will only exist while a download is in progress, and
// allows cancelling the download by calling cancellationToken.cancel().
let cancellationToken;

function checkAction() {
    return {
        type: AUTO_UPDATE_CHECK,
    };
}

function updateAvailableAction(version) {
    return {
        type: AUTO_UPDATE_AVAILABLE,
        version,
    };
}

function startDownloadAction() {
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

function downloadCancelledAction() {
    return {
        type: AUTO_UPDATE_DOWNLOAD_CANCELLED,
    };
}

function updateDownloadingAction(percentDownloaded) {
    return {
        type: AUTO_UPDATE_DOWNLOADING,
        percentDownloaded,
    };
}

function updateErrorAction(error) {
    return {
        type: AUTO_UPDATE_ERROR,
        error,
    };
}

export function postponeUpdate() {
    return {
        type: AUTO_UPDATE_POSTPONE,
    };
}

export function checkForCoreUpdates() {
    return dispatch => {
        dispatch(checkAction());

        const checkForUpdatesPromise = autoUpdater.checkForUpdates();
        if (!checkForUpdatesPromise) {
            log.warn(
                'Not checking for nRF Connect updates. Auto update is not ' +
                    'yet supported for this platform.'
            );
            return Promise.resolve();
        }

        // checkForUpdatesPromise will resolve with result whether or not update
        // is available, but the result will contain a cancellationToken and a
        // downloadPromise only if there is an update
        return checkForUpdatesPromise
            .then(result => {
                if (result.cancellationToken) {
                    dispatch(updateAvailableAction(result.updateInfo.version));
                }
            })
            .catch(error => {
                dispatch(updateErrorAction(error));
            });
    };
}

export function startDownload() {
    return dispatch => {
        if (cancellationToken) {
            dispatch(
                ErrorDialogActions.showDialog(
                    'Download was requested ' +
                        'but another download operation is already in progress.'
                )
            );
            return;
        }

        dispatch(startDownloadAction());

        autoUpdater.on('download-progress', progressObj => {
            dispatch(updateDownloadingAction(progressObj.percent));
        });

        autoUpdater.on('update-downloaded', async () => {
            if (!UsageDataActions.isUsageDataOn()) {
                dispatch(UsageDataActions.resetUsageData());
            }

            cancellationToken = null;
            autoUpdater.removeAllListeners();
            autoUpdater.quitAndInstall();
        });

        autoUpdater.on('error', error => {
            cancellationToken = null;
            autoUpdater.removeAllListeners();
            if (error.message === 'Cancelled') {
                dispatch(downloadCancelledAction());
            } else {
                dispatch(updateErrorAction(error));
                dispatch(ErrorDialogActions.showDialog(error.message));
            }
        });

        cancellationToken = new CancellationToken();
        autoUpdater.downloadUpdate(cancellationToken);
    };
}

export function cancelDownload() {
    return dispatch => {
        if (cancellationToken) {
            cancellationToken.cancel();
            dispatch(cancelDownloadAction());
        } else {
            dispatch(
                ErrorDialogActions.showDialog(
                    'Unable to cancel. No download is in progress.'
                )
            );
        }
    };
}

export function downloadLatestAppInfo(options = { rejectIfError: false }) {
    return dispatch => {
        dispatch(AppsActions.downloadLatestAppInfoAction());

        return mainApps
            .downloadAppsJsonFiles()
            .then(() => mainApps.generateUpdatesJsonFiles())
            .then(() =>
                dispatch(AppsActions.downloadLatestAppInfoSuccessAction())
            )
            .then(() => dispatch(AppsActions.loadOfficialApps()))
            .catch(error => {
                dispatch(AppsActions.downloadLatestAppInfoErrorAction());
                if (options.rejectIfError) {
                    throw error;
                } else if (error.sourceNotFound) {
                    dispatch(
                        ErrorDialogActions.showDialog(
                            `Unable to retrieve the source “${error.cause.name}” from ${error.cause.url}. \n\n` +
                                'This is usually caused by outdated app sources in the settings, ' +
                                'where the sources files was removed from the server.',
                            {
                                'Remove source': () => {
                                    dispatch(
                                        SettingsActions.removeSource(
                                            error.cause.name
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
