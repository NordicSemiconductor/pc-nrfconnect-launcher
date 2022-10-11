/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { configureStore } from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';
import { errorDialogReducer as errorDialog } from 'pc-nrfconnect-shared';

import apps from './features/apps/appsSlice';
import filter from './features/filter/filterSlice';
import launcherUpdate from './features/launcherUpdate/launcherUpdateSlice';
import proxyLogin from './features/proxyLogin/proxyLoginSlice';
import releaseNotesDialog from './features/releaseNotes/releaseNotesDialogSlice';
import settings from './features/settings/settingsSlice';
import sources from './features/sources/sourcesSlice';
import usageData from './features/usageData/usageDataSlice';

enableMapSet();

export const reducer = {
    apps,
    errorDialog,
    filter,
    launcherUpdate,
    proxyLogin,
    releaseNotesDialog,
    settings,
    sources,
    usageData,
};

const store = configureStore({
    reducer,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
