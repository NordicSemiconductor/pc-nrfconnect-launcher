/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// @ts-check

const { createLogger, transports } = require('winston');
const path = require('path');
const { autoUpdater, CancellationToken } = require('electron-updater');
const { sendFromMain: showErrorDialog } = require('../ipc/errorDialog');
const { LauncherUpdateCheckResult } = require('../ipc/launcherUpdate'); // eslint-disable-line @typescript-eslint/no-unused-vars
const {
    sendUpdateStartedFromMain: updateStarted,
    sendUpdateProgressFromMain: updateProgress,
    sendUpdateFinishedFromMain: updateFinished,
} = require('../ipc/launcherUpdateProgress');

const config = require('./config');

/** @type {CancellationToken | undefined} */
let installCancellationToken;

const nrfConnectPath = path.join(config.getUserDataDir(), 'logs');
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

/**
 * @returns {Promise<LauncherUpdateCheckResult>} Check result
 */
const checkForUpdate = async () => {
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

const startUpdate = () => {
    if (installCancellationToken != null) {
        showErrorDialog(
            'Download was requested but another download operation is ' +
                'already in progress.'
        );
        return;
    }

    updateStarted();

    autoUpdater.on('download-progress', progressObj => {
        updateProgress(progressObj.percentage);
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

const cancelUpdate = () => {
    if (installCancellationToken != null) {
        installCancellationToken.cancel();
    } else {
        showErrorDialog('Unable to cancel. No download is in progress.');
    }
};

module.exports = {
    checkForUpdate,
    startUpdate,
    cancelUpdate,
};
