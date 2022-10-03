/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// @ts-check

import { ErrorDialogActions, logger } from 'pc-nrfconnect-shared';

import { downloadAllAppsJsonFiles } from '../../../ipc/apps';
import { cancelUpdate, checkForUpdate } from '../../../ipc/launcherUpdate';
import * as AppsActions from '../../actions/appsActions';
import mainConfig from '../../util/mainConfig';
import { showUpdateCheckComplete } from '../settings/settingsSlice';
import { removeSource } from '../sources/sourcesEffects';
import {
    cancelDownload as cancelLauncherDownload,
    reset,
    updateAvailable,
} from './launcherUpdateSlice';

export const checkForCoreUpdates = () => async dispatch => {
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
    shouldCheckForUpdatesAtStartup => async dispatch => {
        if (
            shouldCheckForUpdatesAtStartup &&
            !mainConfig().isSkipUpdateCore &&
            process.env.NODE_ENV !== 'development'
        ) {
            await dispatch(checkForCoreUpdates());
        }
    };

export const cancelDownload = () => dispatch => {
    cancelUpdate();
    dispatch(cancelLauncherDownload());
};

export const downloadLatestAppInfo =
    (options = { rejectIfError: false }) =>
    dispatch => {
        dispatch(AppsActions.downloadLatestAppInfoAction());

        return downloadAllAppsJsonFiles()
            .then(() =>
                dispatch(AppsActions.downloadLatestAppInfoSuccessAction())
            )
            .then(() => dispatch(AppsActions.loadDownloadableApps()))
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
    shouldCheckForUpdatesAtStartup => dispatch => {
        if (shouldCheckForUpdatesAtStartup && !mainConfig().isSkipUpdateApps) {
            dispatch(downloadLatestAppInfo());
        }
    };

export const checkForUpdatesManually = () => dispatch =>
    dispatch(downloadLatestAppInfo({ rejectIfError: true }))
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
