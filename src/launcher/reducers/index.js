/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { enableMapSet } from 'immer';
import { errorDialogReducer as errorDialog } from 'pc-nrfconnect-shared';
import { combineReducers } from 'redux';

import apps from '../features/apps/appsSlice';
import filter from '../features/filter/filterSlice';
import launcherUpdate from '../features/launcherUpdate/launcherUpdateSlice';
import proxyLogin from '../features/proxyLogin/proxyLoginSlice';
import releaseNotesDialog from '../features/releaseNotes/releaseNotesDialogSlice';
import settings from '../features/settings/settingsSlice';
import sources from '../features/sources/sourcesSlice';
import usageData from '../features/usageData/usageDataSlice';

enableMapSet();

export default combineReducers({
    apps,
    errorDialog,
    filter,
    launcherUpdate,
    proxyLogin,
    releaseNotesDialog,
    settings,
    sources,
    usageData,
});
