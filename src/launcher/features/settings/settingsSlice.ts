/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../..';

export type State = {
    shouldCheckForUpdatesAtStartup: boolean;
    isUpdateCheckCompleteVisible: boolean;
};

const initialState: State = {
    shouldCheckForUpdatesAtStartup: true,
    isUpdateCheckCompleteVisible: false,
};

const slice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setCheckUpdatesAtStartup(
            state,
            { payload: isEnabled }: PayloadAction<boolean>
        ) {
            state.shouldCheckForUpdatesAtStartup = isEnabled;
        },
        showUpdateCheckComplete(state) {
            state.isUpdateCheckCompleteVisible = true;
        },
        hideUpdateCheckComplete(state) {
            state.isUpdateCheckCompleteVisible = false;
        },
    },
});

export default slice.reducer;

export const {
    setCheckUpdatesAtStartup,
    showUpdateCheckComplete,
    hideUpdateCheckComplete,
} = slice.actions;

export const getShouldCheckForUpdatesAtStartup = (state: RootState) =>
    state.settings.shouldCheckForUpdatesAtStartup;
export const getIsUpdateCheckCompleteVisible = (state: RootState) =>
    state.settings.isUpdateCheckCompleteVisible;
