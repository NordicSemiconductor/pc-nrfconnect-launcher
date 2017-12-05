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
import * as ErrorDialogActions from '../../../actions/errorDialogActions';

export const AUTO_UPDATE_CHECK = 'AUTO_UPDATE_CHECK';
export const AUTO_UPDATE_AVAILABLE = 'AUTO_UPDATE_AVAILABLE';
export const AUTO_UPDATE_POSTPONE = 'AUTO_UPDATE_POSTPONE';
export const AUTO_UPDATE_START_DOWNLOAD = 'AUTO_UPDATE_START_DOWNLOAD';
export const AUTO_UPDATE_CANCEL_DOWNLOAD = 'AUTO_UPDATE_CANCEL_DOWNLOAD';
export const AUTO_UPDATE_DOWNLOAD_CANCELLED = 'AUTO_UPDATE_DOWNLOAD_CANCELLED';
export const AUTO_UPDATE_DOWNLOADING = 'AUTO_UPDATE_DOWNLOADING';
export const AUTO_UPDATE_ERROR = 'AUTO_UPDATE_ERROR';

const { autoUpdater, CancellationToken } = remote.require('./main/autoUpdate');
const cancellationToken = new CancellationToken();
const isWindows = process.platform === 'win32';

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
            log.warn('Not checking for nRF Connect updates. Auto update is not ' +
                'yet supported for this platform.');
            return Promise.resolve();
        }

        return checkForUpdatesPromise
            .then(result => {
                console.log(result);
                if (autoUpdater.updateAvailable) {
                    dispatch(updateAvailableAction(result.versionInfo.version));
                }
            })
            .catch(error => {
                dispatch(updateErrorAction(error));
            });
    };
}

export function startDownload() {
    return dispatch => {
        dispatch(startDownloadAction());

        autoUpdater.on('download-progress', progressObj => {
            dispatch(updateDownloadingAction(progressObj.percent));
        });
        autoUpdater.on('update-downloaded', () => {
            autoUpdater.removeAllListeners();
            autoUpdater.quitAndInstall();
        });
        autoUpdater.on('error', error => {
            autoUpdater.removeAllListeners();
            if (error.message === 'Cancelled') {
                dispatch(downloadCancelledAction());
            } else {
                dispatch(updateErrorAction(error));
                dispatch(ErrorDialogActions.showDialog(error.message));
            }
        });

        autoUpdater.downloadUpdate(cancellationToken);
    };
}

export function cancelDownload() {
    return dispatch => {
        dispatch(cancelDownloadAction());
        cancellationToken.cancel();
    };
}
