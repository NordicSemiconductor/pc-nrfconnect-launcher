/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ProgressInfo } from 'builder-util-runtime';
import { app } from 'electron';
import { autoUpdater, CancellationToken } from 'electron-updater';
import path from 'path';
import { createLogger, transports } from 'winston';

import {
    updateFinished,
    updateProgress,
    updateStarted,
} from '../ipc/launcherUpdateProgress';
import { showErrorDialog } from '../ipc/showErrorDialog';

let installCancellationToken: CancellationToken | undefined;

const nrfConnectPath = path.join(app.getPath('userData'), 'logs');
const logger = createLogger({
    transports: [
        new transports.File({
            dirname: nrfConnectPath,
            filename: 'autoUpdate.log',
            level: 'info',
        }),
    ],
});

autoUpdater.autoDownload = false;
autoUpdater.logger = logger;

export const checkForUpdate = async () => {
    const updateCheckResult = autoUpdater.checkForUpdates();
    if (!updateCheckResult) {
        logger.warn(
            'Not checking for nRF Connect for Desktop updates. ' +
                'Auto update is not yet supported for this platform.'
        );
        throw new Error('Auto update not supported');
    }

    // checkForUpdatesPromise will resolve with result whether or not update
    // is available, but the result will contain a cancellationToken and a
    // downloadPromise only if there is an update
    const { updateInfo, cancellationToken } = await updateCheckResult;
    return {
        isUpdateAvailable: !!cancellationToken,
        newVersion: updateInfo.version,
    };
};

export const startUpdate = () => {
    if (installCancellationToken !== undefined) {
        showErrorDialog(
            'Download was requested but another download operation is ' +
                'already in progress.'
        );
        return;
    }

    updateStarted();

    autoUpdater.on('download-progress', (progressObj: ProgressInfo) => {
        updateProgress(progressObj.percent);
    });

    autoUpdater.on('update-downloaded', () => {
        updateFinished(true);
        installCancellationToken = undefined;
        autoUpdater.removeAllListeners();
        autoUpdater.quitAndInstall();
    });

    autoUpdater.on('error', error => {
        updateFinished(false);
        installCancellationToken = undefined;
        autoUpdater.removeAllListeners();
        if (error.message !== 'cancelled') {
            showErrorDialog(error.message);
        }
    });

    installCancellationToken = new CancellationToken();
    autoUpdater.downloadUpdate(installCancellationToken);
};

export const cancelUpdate = () => {
    if (installCancellationToken !== undefined) {
        installCancellationToken.cancel();
        installCancellationToken = undefined;
    } else {
        showErrorDialog('Unable to cancel. No download is in progress.');
    }
};
