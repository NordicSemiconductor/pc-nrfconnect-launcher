/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Settings } from '../../../ipc/settings';
import type { AppDispatch } from '../..';
import {
    setAllShownSources,
    setNameFilter,
    setShownStates,
} from './filterSlice';

export const initializeFilters =
    (settings: Settings) => (dispatch: AppDispatch) => {
        dispatch(setShownStates(settings['app-management.show']));
        dispatch(setNameFilter(settings['app-management.filter']));
        dispatch(
            setAllShownSources(
                Object.entries(settings['app-management.sources'])
                    .filter(([, visible]) => visible)
                    .flatMap(([sourcename]) => sourcename)
            )
        );
    };
