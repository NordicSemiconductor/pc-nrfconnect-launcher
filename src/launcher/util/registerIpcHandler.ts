/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ErrorDialogActions } from '@nordicsemiconductor/pc-nrfconnect-shared';

import * as downloadProgress from '../../ipc/downloadProgress';
import * as launcherUpdateProgress from '../../ipc/launcherUpdateProgress';
import * as proxyLogin from '../../ipc/proxyLogin';
import * as showErrorDialog from '../../ipc/showErrorDialog';
import { updateAppProgress } from '../features/apps/appsSlice';
import {
    reset,
    startDownload,
    updateDownloading,
} from '../features/launcherUpdate/launcherUpdateSlice';
import { loginRequestedByServer } from '../features/proxyLogin/proxyLoginSlice';
import type { AppDispatch } from '../store';

export default (dispatch: AppDispatch) => {
    downloadProgress.forMain.registerDownloadProgress(progress => {
        dispatch(updateAppProgress(progress));
    });

    showErrorDialog.forMain.registerShowErrorDialog(errorMessage => {
        dispatch(ErrorDialogActions.showDialog(errorMessage));
    });

    proxyLogin.forMain.registerRequestProxyLogin((requestId, authInfo) => {
        dispatch(loginRequestedByServer({ requestId, authInfo }));
    });

    launcherUpdateProgress.forMain.registerUpdateStarted(() => {
        dispatch(startDownload());
    });
    launcherUpdateProgress.forMain.registerUpdateProgress(percentage => {
        dispatch(updateDownloading(percentage));
    });
    launcherUpdateProgress.forMain.registerUpdateFinished(() => {
        dispatch(reset());
    });
};
