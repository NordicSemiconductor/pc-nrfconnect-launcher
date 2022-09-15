/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { errorDialogReducer as errorDialog } from 'pc-nrfconnect-shared';
import { combineReducers } from 'redux';

import launcherUpdate from '../features/launcherUpdate/launcherUpdateSlice';
import apps from './appsReducer';
import proxy from './proxyReducer';
import releaseNotesDialog from './releaseNotesDialogReducer';
import settings from './settingsReducer';

export default combineReducers({
    releaseNotesDialog,
    apps,
    launcherUpdate,
    proxy,
    settings,
    errorDialog,
});
