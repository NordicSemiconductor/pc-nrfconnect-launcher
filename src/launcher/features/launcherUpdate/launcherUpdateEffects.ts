/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    describeError,
    ErrorDialogActions,
    logger,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { inMain } from '../../../ipc/launcherUpdate';
import type { AppThunk } from '../../store';
import { downloadLatestAppInfos } from '../apps/appsEffects';
import { checkForJLinkUpdate } from '../jlinkUpdate/jlinkUpdateEffects';
import { isJLinkUpdateDialogVisible } from '../jlinkUpdate/jlinkUpdateSlice';
import { getIsErrorVisible as getIsProxyErrorShown } from '../proxyLogin/proxyLoginSlice';
import { showUpdateCheckComplete } from '../settings/settingsSlice';
import { reset, updateAvailable } from './launcherUpdateSlice';

export const checkForLauncherUpdate = (): AppThunk => async dispatch => {
    try {
        const { isUpdateAvailable, newVersion } = await inMain.checkForUpdate();

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
    inMain.cancelUpdate();
    dispatch(reset());
};

export const checkForUpdatesManually =
    (): AppThunk => async (dispatch, getState) => {
        try {
            await dispatch(checkForJLinkUpdate(false));
            if (isJLinkUpdateDialogVisible(getState())) {
                return;
            }
        } catch (error) {
            logger.error(error);
        }

        await dispatch(checkForLauncherUpdate());
    };

export const checkForAppAndLauncherUpdateManually =
    (): AppThunk => async (dispatch, getState) => {
        try {
            await dispatch(downloadLatestAppInfos());
            if (!getIsProxyErrorShown(getState())) {
                dispatch(showUpdateCheckComplete());

                dispatch(checkForLauncherUpdate());
            }
        } catch (error) {
            ErrorDialogActions.showDialog(
                `Unable to check for updates: ${describeError(error)}`
            );
        }
    };
