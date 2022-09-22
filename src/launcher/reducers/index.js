/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { errorDialogReducer as errorDialog } from 'pc-nrfconnect-shared';
import { combineReducers } from 'redux';

import launcherUpdate from '../features/launcherUpdate/launcherUpdateSlice';
import settings from '../features/settings/settingsSlice';
import sources from '../features/sources/sourcesSlice';
import usageData from '../features/usageData/usageDataSlice';
import apps from './appsReducer';
import proxy from './proxyReducer';
import releaseNotesDialog from './releaseNotesDialogReducer';

export default combineReducers({
    apps,
    errorDialog,
    launcherUpdate,
    proxy,
    releaseNotesDialog,
    settings,
    sources,
    usageData,
});
