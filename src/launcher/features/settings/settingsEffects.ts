/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { describeError, ErrorDialogActions } from 'pc-nrfconnect-shared';

import {
    getSetting,
    setCheckUpdatesAtStartup as setCheckUpdatesAtStartupInSettings,
} from '../../../ipc/settings';
import type { AppDispatch } from '../..';
import { setCheckUpdatesAtStartup } from './settingsSlice';

export const loadSettings = () => async (dispatch: AppDispatch) => {
    try {
        const shouldCheckForUpdatesAtStartup = <boolean>(
            await getSetting('shouldCheckForUpdatesAtStartup')
        );
        dispatch(setCheckUpdatesAtStartup(shouldCheckForUpdatesAtStartup));
    } catch (error) {
        dispatch(
            ErrorDialogActions.showDialog(
                `Unable to load settings: ${describeError(error)}`
            )
        );
    }
};

export const checkUpdatesAtStartupChanged =
    (isEnabled: boolean) => (dispatch: AppDispatch) => {
        dispatch(setCheckUpdatesAtStartup(isEnabled));
        setCheckUpdatesAtStartupInSettings(isEnabled);
    };
