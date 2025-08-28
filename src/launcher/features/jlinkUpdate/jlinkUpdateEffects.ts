/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getVersionToInstall } from '@nordicsemiconductor/nrf-jlink-js';

import bundledJlinkVersion from '../../../main/bundledJlink';
import { AppThunk } from '../../store';
import { updateAvailable } from './jlinkUpdateSlice';

export const checkForJLinkUpdate =
    (): AppThunk<Promise<{ isUpdateAvailable: boolean }>> => dispatch =>
        getVersionToInstall(bundledJlinkVersion).then(status => {
            const isUpdateAvailable = !!(
                status.outdated && status.versionToBeInstalled
            );

            if (isUpdateAvailable) {
                dispatch(
                    updateAvailable({
                        versionToBeInstalled: status.versionToBeInstalled!, // eslint-disable-line @typescript-eslint/no-non-null-assertion -- Must be non-null because of the check above
                        installedVersion: status.installedVersion,
                    })
                );
            }
            return { isUpdateAvailable };
        });
