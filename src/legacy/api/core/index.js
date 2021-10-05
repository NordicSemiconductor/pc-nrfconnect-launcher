/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    getAppDataDir,
    getAppDir,
    getAppLogDir,
    getUserDataDir,
} from 'pc-nrfconnect-shared';

import {
    startWatchingDevices,
    stopWatchingDevices,
} from '../../app/actions/deviceActions';

export {
    getAppDir,
    getAppDataDir,
    getAppLogDir,
    getUserDataDir,
    startWatchingDevices,
    stopWatchingDevices,
};
