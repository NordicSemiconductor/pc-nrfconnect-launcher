/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { errorDialogReducer as errorDialog } from '@nordicsemiconductor/pc-nrfconnect-shared';
import { configureStore } from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

import appDialogs from './features/apps/appDialogsSlice';
import apps from './features/apps/appsSlice';
import filter from './features/filter/filterSlice';
import launcherUpdate from './features/launcherUpdate/launcherUpdateSlice';
import localAppInstall from './features/localAppInstall/localAppInstallSlice';
import proxyLogin from './features/proxyLogin/proxyLoginSlice';
import releaseNotesDialog from './features/releaseNotes/releaseNotesDialogSlice';
import settings from './features/settings/settingsSlice';
import sources from './features/sources/sourcesSlice';
import usageData from './features/telemetry/telemetrySlice';

enableMapSet();

export const reducer = {
    apps,
    appDialogs,
    errorDialog,
    filter,
    launcherUpdate,
    localAppInstall,
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

export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    AnyAction
>;

export default store;
