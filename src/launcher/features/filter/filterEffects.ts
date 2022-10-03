/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getSetting } from '../../../ipc/settings';
import { SourceName } from '../../../ipc/sources';
import type { AppDispatch } from '../..';
import {
    setAllShownSources,
    setNameFilter,
    setShownStates,
} from './filterSlice';

export const initializeFilters = () => async (dispatch: AppDispatch) => {
    // TODO: Do a single IPC call instead

    const show = (await getSetting('app-management.show')) as {
        installed: boolean;
        available: boolean;
    };
    dispatch(
        setShownStates({
            installed: show.installed,
            available: show.available,
        })
    );

    const filter = (await getSetting('app-management.filter')) as string;
    dispatch(setNameFilter(filter));

    const sources = (await getSetting('app-management.sources')) as Record<
        SourceName,
        boolean
    >;
    dispatch(
        setAllShownSources(
            Object.entries(sources)
                .filter(([, visible]) => visible)
                .flatMap(([sourcename]) => sourcename)
        )
    );
};
