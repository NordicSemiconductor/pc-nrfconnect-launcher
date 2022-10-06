/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { setCheckUpdatesAtStartup as setCheckUpdatesAtStartupInSettings } from '../../../ipc/settings';
import type { AppDispatch } from '../..';
import { setCheckUpdatesAtStartup } from './settingsSlice';

export const checkUpdatesAtStartupChanged =
    (isEnabled: boolean) => (dispatch: AppDispatch) => {
        dispatch(setCheckUpdatesAtStartup(isEnabled));
        setCheckUpdatesAtStartupInSettings(isEnabled);
    };
