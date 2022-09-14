/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// @ts-check

import { ErrorDialogActions, usageData } from 'pc-nrfconnect-shared';

import { registerDownloadProgress } from '../../ipc/downloadProgress';
import {
    registerUpdateFinished,
    registerUpdateProgress,
    registerUpdateStarted,
} from '../../ipc/launcherUpdateProgress';
import { registerRequestProxyLogin } from '../../ipc/proxyLogin';
import { registerShowErrorDialog } from '../../ipc/showErrorDialog';
import { updateInstallProgressAction } from '../actions/appsActions';
import { authenticate } from '../actions/proxyActions';
import {
    reset,
    startDownload,
    updateDownloading,
} from '../features/launcherUpdate/launcherUpdateSlice';

export default dispatch => {
    registerDownloadProgress(progress => {
        dispatch(updateInstallProgressAction(progress));
    });

    registerShowErrorDialog(errorMessage => {
        dispatch(ErrorDialogActions.showDialog(errorMessage));
    });

    registerRequestProxyLogin((requestId, authInfo) => {
        dispatch(authenticate(requestId, authInfo));
    });

    registerUpdateStarted(() => {
        dispatch(startDownload());
    });
    registerUpdateProgress(percentage => {
        dispatch(updateDownloading(percentage));
    });
    registerUpdateFinished(isSuccessful => {
        if (isSuccessful) {
            usageData.reset();
        }
        dispatch(reset());
    });
};
