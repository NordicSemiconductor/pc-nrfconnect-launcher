/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { errorDialogReducer as errorDialog } from 'pc-nrfconnect-shared';
import { combineReducers } from 'redux';

import launcherUpdate from '../features/launcherUpdate/launcherUpdateSlice';
import proxyLogin from '../features/proxyLogin/proxyLoginSlice';
import releaseNotesDialog from '../features/releaseNotes/releaseNotesDialogSlice';
import settings from '../features/settings/settingsSlice';
import sources from '../features/sources/sourcesSlice';
import usageData from '../features/usageData/usageDataSlice';
import apps from './appsReducer';

export default combineReducers({
    apps,
    errorDialog,
    launcherUpdate,
    proxyLogin,
    releaseNotesDialog,
    settings,
    sources,
    usageData,
});
