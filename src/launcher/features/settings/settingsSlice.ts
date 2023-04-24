/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import {
    getCheckForUpdatesAtStartup as getPersistedCheckForUpdatesAtStartup,
    setCheckForUpdatesAtStartup as setPersistedCheckForUpdatesAtStartup,
} from '../../../ipc/persistedStore';
import type { RootState } from '../../store';

export type State = {
    shouldCheckForUpdatesAtStartup: boolean;
    isUpdateCheckCompleteVisible: boolean;
};

const initialState: State = {
    shouldCheckForUpdatesAtStartup: getPersistedCheckForUpdatesAtStartup(),
    isUpdateCheckCompleteVisible: false,
};

const slice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setCheckForUpdatesAtStartup(
            state,
            { payload: checkForUpdatesAtStartup }: PayloadAction<boolean>
        ) {
            state.shouldCheckForUpdatesAtStartup = checkForUpdatesAtStartup;
            setPersistedCheckForUpdatesAtStartup(checkForUpdatesAtStartup);
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
    setCheckForUpdatesAtStartup,
    showUpdateCheckComplete,
    hideUpdateCheckComplete,
} = slice.actions;

export const getShouldCheckForUpdatesAtStartup = (state: RootState) =>
    state.settings.shouldCheckForUpdatesAtStartup;
export const getIsUpdateCheckCompleteVisible = (state: RootState) =>
    state.settings.isUpdateCheckCompleteVisible;
