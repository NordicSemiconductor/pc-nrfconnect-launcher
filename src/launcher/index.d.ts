/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';

import type { SliceState as LauncherUpdateState } from './features/launcherUpdate/launcherUpdateSlice';

export type RootState = {
    launcherUpdate: LauncherUpdateState;
    // TODO: Add more sub states
};
export type AppDispatch = ThunkDispatch<RootState, null, AnyAction>;

// TODO: As soon as we converted `src/launcher/index.js` to TypeScript:
//          - replace this RootState definition by `ReturnType<typeof store.getState>`
//          - define AppDispatch as `export type AppDispatch = typeof store.dispatch`
