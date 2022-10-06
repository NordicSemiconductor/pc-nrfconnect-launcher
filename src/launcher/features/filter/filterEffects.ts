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
        dispatch(setShownStates(settings.appFilter.shownStates));
        dispatch(setNameFilter(settings.appFilter.nameFilter));
        dispatch(setAllShownSources(settings.appFilter.shownSources));
    };
