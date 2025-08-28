/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { logger } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { inMain } from '../../../ipc/launcherUpdate';
import type { AppThunk } from '../../store';
import { reset, updateAvailable } from './launcherUpdateSlice';

export const checkForLauncherUpdate =
    (): AppThunk<Promise<{ isUpdateAvailable: boolean }>> => async dispatch => {
        try {
            const { isUpdateAvailable, newVersion } =
                await inMain.checkForUpdate();

            if (isUpdateAvailable) {
                dispatch(updateAvailable(newVersion));
            } else {
                dispatch(reset());
            }

            return { isUpdateAvailable };
        } catch (error) {
            logger.warn(error);

            return { isUpdateAvailable: false };
        }
    };

export const cancelDownload = (): AppThunk => dispatch => {
    inMain.cancelUpdate();
    dispatch(reset());
};
