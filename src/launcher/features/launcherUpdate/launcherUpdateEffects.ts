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

import { cancelUpdate, checkForUpdate } from '../../../ipc/launcherUpdate';
import type { AppThunk } from '../../store';
import { downloadLatestAppInfos } from '../apps/appsEffects';
import { showUpdateCheckComplete } from '../settings/settingsSlice';
import { reset, updateAvailable } from './launcherUpdateSlice';

export const checkForCoreUpdates = (): AppThunk => async dispatch => {
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

export const cancelDownload = (): AppThunk => dispatch => {
    cancelUpdate();
    dispatch(reset());
};

export const checkForUpdatesManually = (): AppThunk => async dispatch => {
    try {
        await dispatch(downloadLatestAppInfos());
        dispatch(showUpdateCheckComplete());

        dispatch(checkForCoreUpdates());
    } catch (error) {
        ErrorDialogActions.showDialog(
            `Unable to check for updates: ${describeError(error)}`
        );
    }
};
