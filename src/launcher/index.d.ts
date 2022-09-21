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

import type { SliceState as LauncherUpdateState } from './features/launcherUpdate/launcherUpdateSlice';
import type { SliceState as SettingsState } from './features/settings/settingsSlice';
import type { SliceState as SourcesState } from './features/sources/sourcesSlice';

export type RootState = {
    launcherUpdate: LauncherUpdateState;
    settings: SettingsState;
    sources: SourcesState;
    // TODO: Add more sub states
};
export type AppDispatch = ThunkDispatch<RootState, null, AnyAction>;

export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    AnyAction
>;
