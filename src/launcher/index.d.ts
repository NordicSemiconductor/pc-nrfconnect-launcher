/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
// TODO: As soon as we converted `src/launcher/index.js` to TypeScript:
//          - replace this RootState definition by `ReturnType<typeof store.getState>`
//          - define AppDispatch as `export type AppDispatch = typeof store.dispatch`
import type { ThunkAction } from 'redux-thunk';

import type { State as Apps } from './features/apps/appsSlice';
import type { State as Filter } from './features/filter/filterSlice';
import type { State as LauncherUpdate } from './features/launcherUpdate/launcherUpdateSlice';
import type { State as ProxyLogin } from './features/proxyLogin/proxyLoginSlice';
import type { State as ReleaseNotesDialog } from './features/releaseNotes/releaseNotesDialogSlice';
import type { State as Settings } from './features/settings/settingsSlice';
import type { State as Sources } from './features/sources/sourcesSlice';
import type { State as UsageData } from './features/usageData/usageDataSlice';

export type RootState = {
    apps: Apps;
    filter: Filter;
    launcherUpdate: LauncherUpdate;
    proxyLogin: ProxyLogin;
    releaseNotesDialog: ReleaseNotesDialog;
    settings: Settings;
    sources: Sources;
    usageData: UsageData;
};
export type AppDispatch = ThunkDispatch<RootState, null, AnyAction>;

export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    AnyAction
>;
