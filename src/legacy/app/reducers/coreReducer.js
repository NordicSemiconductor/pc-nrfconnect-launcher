/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { combineReducers } from 'redux';

import errorDialog from '../../reducers/errorDialogReducer';
import appReloadDialog from './appReloadDialogReducer';
import device from './deviceReducer';
import firmwareDialog from './firmwareDialogReducer';
import legacyAppDialog from './legacyAppDialogReducer';
import log from './logReducer';
import navMenu from './navMenuReducer';
import serialPort from './serialPortReducer';

export default combineReducers({
    navMenu,
    log,
    serialPort,
    device,
    firmwareDialog,
    appReloadDialog,
    errorDialog,
    legacyAppDialog,
});
