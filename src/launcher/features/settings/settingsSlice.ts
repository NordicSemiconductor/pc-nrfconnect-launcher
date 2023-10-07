/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import {
    getCheckForUpdatesAtStartup as getPersistedCheckForUpdatesAtStartup,
    getIsQuickStartInfoShownBefore as getPersistedIsQuickStartInfoShownBefore,
    setCheckForUpdatesAtStartup as setPersistedCheckForUpdatesAtStartup,
    setQuickStartInfoWasShown as setPersistedQuickStartInfoWasShown,
} from '../../../ipc/persistedStore';
import type { RootState } from '../../store';

export type State = {
    shouldCheckForUpdatesAtStartup: boolean;
    isUpdateCheckCompleteVisible: boolean;
    isQuickStartInfoShownBefore: boolean;
};

const initialState: State = {
    shouldCheckForUpdatesAtStartup: getPersistedCheckForUpdatesAtStartup(),
    isUpdateCheckCompleteVisible: false,
    isQuickStartInfoShownBefore: getPersistedIsQuickStartInfoShownBefore(),
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
        quickStartInfoWasShown(state) {
            state.isQuickStartInfoShownBefore = true;
            setPersistedQuickStartInfoWasShown();
        },
    },
});

export default slice.reducer;

export const {
    hideUpdateCheckComplete,
    quickStartInfoWasShown,
    setCheckForUpdatesAtStartup,
    showUpdateCheckComplete,
} = slice.actions;

export const getShouldCheckForUpdatesAtStartup = (state: RootState) =>
    state.settings.shouldCheckForUpdatesAtStartup;
export const getIsUpdateCheckCompleteVisible = (state: RootState) =>
    state.settings.isUpdateCheckCompleteVisible;
export const getIsQuickStartInfoShownBefore = (state: RootState) =>
    state.settings.isQuickStartInfoShownBefore;
