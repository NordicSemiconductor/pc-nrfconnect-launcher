/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    describeError,
    ErrorDialogActions,
    logger,
} from 'pc-nrfconnect-shared';

import {
    downloadAllAppsJsonFiles,
    downloadLatestAppInfos as downloadLatestAppInfosInMain,
} from '../../../ipc/apps';
import { cancelUpdate, checkForUpdate } from '../../../ipc/launcherUpdate';
import type { AppDispatch } from '../../store';
import mainConfig from '../../util/mainConfig';
import { fetchInfoForAllDownloadableApps } from '../apps/appsEffects';
import {
    downloadLatestAppInfoError,
    downloadLatestAppInfoStarted,
    downloadLatestAppInfoSuccess,
    updateDownloadableAppInfos,
    updateDownloadableAppInfosFailed,
    updateDownloadableAppInfosStarted,
} from '../apps/appsSlice';
import { showUpdateCheckComplete } from '../settings/settingsSlice';
import { removeSource } from '../sources/sourcesEffects';
import {
    cancelDownload as cancelLauncherDownload,
    reset,
    updateAvailable,
} from './launcherUpdateSlice';

export const checkForCoreUpdates = () => async (dispatch: AppDispatch) => {
    try {
        const { isUpdateAvailable, newVersion } = await checkForUpdate();

        if (isUpdateAvailable) {
            dispatch(updateAvailable(newVersion));
        } else {
            dispatch(reset());
        }
    } catch (error) {
        logger.warn(error);
    }
};

export const checkForCoreUpdatesAtStartup =
    (shouldCheckForUpdatesAtStartup: boolean) =>
    async (dispatch: AppDispatch) => {
        if (
            shouldCheckForUpdatesAtStartup &&
            !mainConfig().isSkipUpdateCore &&
            process.env.NODE_ENV !== 'development'
        ) {
            await dispatch(checkForCoreUpdates());
        }
    };

export const cancelDownload = () => (dispatch: AppDispatch) => {
    cancelUpdate();
    dispatch(cancelLauncherDownload());
};

const downloadLatestAppInfos = () => async (dispatch: AppDispatch) => {
    try {
        dispatch(updateDownloadableAppInfosStarted());
        const latestAppInfos = await downloadLatestAppInfosInMain();
        dispatch(
            updateDownloadableAppInfos({ updatedAppInfos: latestAppInfos.apps })
        );
        latestAppInfos.sourcesFailedToDownload.forEach(source => {
            ErrorDialogActions.showDialog(
                `Unable to retrieve the source “${source.name}” ` +
                    `from ${source.url}. \n\n` +
                    'This is usually caused by outdated app sources in the settings, ' +
                    'where the sources files was removed from the server.',
                {
                    'Remove source': () => {
                        dispatch(removeSource(source.name));
                        dispatch(ErrorDialogActions.hideDialog());
                    },
                    Cancel: () => {
                        dispatch(ErrorDialogActions.hideDialog());
                    },
                }
            );
        });
    } catch (error) {
        dispatch(updateDownloadableAppInfosFailed());
        dispatch(
            ErrorDialogActions.showDialog(
                `Unable to download latest app info: ${describeError(error)}`
            )
        );
    }
};

const downloadLatestAppInfoDeprecated =
    (options = { rejectIfError: false }) =>
    (dispatch: AppDispatch) => {
        dispatch(downloadLatestAppInfoStarted());

        return downloadAllAppsJsonFiles()
            .then(() => dispatch(downloadLatestAppInfoSuccess()))
            .then(() => dispatch(fetchInfoForAllDownloadableApps()))
            .catch(error => {
                dispatch(downloadLatestAppInfoError());
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
                                    dispatch(removeSource(error.source.name));
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

export const downloadLatestAppInfoAtStartup =
    (shouldCheckForUpdatesAtStartup: boolean) => (dispatch: AppDispatch) => {
        if (shouldCheckForUpdatesAtStartup && !mainConfig().isSkipUpdateApps) {
            dispatch(downloadLatestAppInfos());
        }
    };

export const checkForUpdatesManually = () => (dispatch: AppDispatch) =>
    dispatch(downloadLatestAppInfoDeprecated({ rejectIfError: true }))
        .then(() => {
            dispatch(checkForCoreUpdates());
            dispatch(showUpdateCheckComplete());
        })
        .catch(error =>
            dispatch(
                ErrorDialogActions.showDialog(
                    `Unable to check for updates: ${error.message}`
                )
            )
        );
