/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ErrorDialogActions, usageData } from 'pc-nrfconnect-shared';

import { registerDownloadProgress } from '../../ipc/downloadProgress';
import {
    registerUpdateFinished,
    registerUpdateProgress,
    registerUpdateStarted,
} from '../../ipc/launcherUpdateProgress';
import { registerRequestProxyLogin } from '../../ipc/proxyLogin';
import { registerShowErrorDialog } from '../../ipc/showErrorDialog';
import { updateInstallProgress } from '../features/apps/appsSlice';
import {
    reset,
    startDownload,
    updateDownloading,
} from '../features/launcherUpdate/launcherUpdateSlice';
import { loginRequestedByServer } from '../features/proxyLogin/proxyLoginSlice';
import type { AppDispatch } from '../store';

export default (dispatch: AppDispatch) => {
    registerDownloadProgress(progress => {
        dispatch(updateInstallProgress(progress));
    });

    registerShowErrorDialog(errorMessage => {
        dispatch(ErrorDialogActions.showDialog(errorMessage));
    });

    registerRequestProxyLogin((requestId, authInfo) => {
        dispatch(loginRequestedByServer({ requestId, authInfo }));
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
