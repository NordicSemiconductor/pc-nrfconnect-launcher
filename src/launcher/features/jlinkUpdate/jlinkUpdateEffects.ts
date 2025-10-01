/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getJLinkState } from '@nordicsemiconductor/nrf-jlink-js';

import bundledJlinkVersion from '../../../main/bundledJlink';
import { AppThunk } from '../../store';
import { updateAvailable } from './jlinkUpdateSlice';

export const checkForJLinkUpdate =
    ({
        checkOnline,
    }: {
        checkOnline: boolean;
    }): AppThunk<Promise<{ isUpdateAvailable: boolean }>> =>
    dispatch =>
        getJLinkState({
            fallbackVersion: bundledJlinkVersion,
            checkOnline,
        }).then(s => {
            const isUpdateAvailable =
                s.status === 'not installed' ||
                s.status === 'should be updated';

            if (isUpdateAvailable) {
                dispatch(
                    updateAvailable({
                        versionToBeInstalled: s.versionToBeInstalled,
                        installedVersion:
                            s.status === 'should be updated'
                                ? s.installedVersion
                                : undefined,
                    }),
                );
            }

            return { isUpdateAvailable };
        });
