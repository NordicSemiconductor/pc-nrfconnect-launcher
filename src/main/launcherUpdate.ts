/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ProgressInfo } from 'builder-util-runtime';
import { autoUpdater, CancellationToken } from 'electron-updater';
import path from 'path';
import { createLogger, transports } from 'winston';

import { getUseChineseAppServer } from '../common/persistedStore';
import { inRenderer } from '../ipc/launcherUpdateProgress';
import * as showError from '../ipc/showErrorDialog';
import { getUserDataDir } from './config';

let installCancellationToken: CancellationToken | undefined;

const nrfConnectPath = path.join(getUserDataDir(), 'logs');
const logger = createLogger({
    transports: [
        new transports.File({
            dirname: nrfConnectPath,
            filename: 'autoUpdate.log',
            level: 'info',
        }),
    ],
});

export const setUseChineseUpdateServer = (useChineseServer: boolean) => {
    const autoupdateDomain = useChineseServer ? 'cn' : 'com';

    autoUpdater.setFeedURL(
        `https://files.nordicsemi.${autoupdateDomain}/artifactory/swtools/external/ncd/launcher/`
    );
};

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
        showError.inRenderer.showErrorDialog(
            'Download was requested but another download operation is ' +
                'already in progress.'
        );
        return;
    }

    inRenderer.updateStarted();

    autoUpdater.on('download-progress', (progressObj: ProgressInfo) => {
        inRenderer.updateProgress(progressObj.percent);
    });

    autoUpdater.on('update-downloaded', () => {
        inRenderer.updateFinished(true);
        installCancellationToken = undefined;
        autoUpdater.removeAllListeners();
        autoUpdater.quitAndInstall();
    });

    autoUpdater.on('error', err => {
        inRenderer.updateFinished(false);
        installCancellationToken = undefined;
        autoUpdater.removeAllListeners();
        if (err.message !== 'cancelled') {
            showError.inRenderer.showErrorDialog(err.message);
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
        showError.inRenderer.showErrorDialog(
            'Unable to cancel. No download is in progress.'
        );
    }
};

autoUpdater.autoDownload = false;
autoUpdater.logger = logger;

setUseChineseUpdateServer(getUseChineseAppServer());
