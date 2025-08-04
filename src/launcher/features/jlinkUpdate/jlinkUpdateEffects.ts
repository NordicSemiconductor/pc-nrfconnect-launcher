/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getVersionToInstall } from '@nordicsemiconductor/nrf-jlink-js';

import { bundledJlinkVersion } from '../../../main/bundledJlink';
import { AppThunk } from '../../store';
import { updateAvailable } from './jlinkUpdateSlice';

export const checkForJLinkUpdate =
    (inStartup = true): AppThunk<Promise<boolean>> =>
    dispatch =>
        getVersionToInstall(bundledJlinkVersion).then(status => {
            if (status.outdated && status.versionToBeInstalled) {
                dispatch(
                    updateAvailable({
                        versionToBeInstalled: status.versionToBeInstalled,
                        installedVersion: status.installedVersion,
                        inStartup,
                    })
                );
                return true;
            }
            return false;
        });
