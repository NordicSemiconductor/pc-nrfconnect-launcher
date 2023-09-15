/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import {
    getCheckForUpdatesAtStartup as getPersistedCheckForUpdatesAtStartup,
    getIsQuickstartInfoShownBefore as getPersistedIsQuickstartInfoShownBefore,
    setCheckForUpdatesAtStartup as setPersistedCheckForUpdatesAtStartup,
    setQuickstartInfoWasShown as setPersistedQuickstartInfoWasShown,
} from '../../../ipc/persistedStore';
import type { RootState } from '../../store';

export type State = {
    shouldCheckForUpdatesAtStartup: boolean;
    isUpdateCheckCompleteVisible: boolean;
    isQuickstartInfoShownBefore: boolean;
};

const initialState: State = {
    shouldCheckForUpdatesAtStartup: getPersistedCheckForUpdatesAtStartup(),
    isUpdateCheckCompleteVisible: false,
    isQuickstartInfoShownBefore: getPersistedIsQuickstartInfoShownBefore(),
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
        quickstartInfoWasShown(state) {
            state.isQuickstartInfoShownBefore = true;
            setPersistedQuickstartInfoWasShown();
        },
    },
});

export default slice.reducer;

export const {
    hideUpdateCheckComplete,
    quickstartInfoWasShown,
    setCheckForUpdatesAtStartup,
    showUpdateCheckComplete,
} = slice.actions;

export const getShouldCheckForUpdatesAtStartup = (state: RootState) =>
    state.settings.shouldCheckForUpdatesAtStartup;
export const getIsUpdateCheckCompleteVisible = (state: RootState) =>
    state.settings.isUpdateCheckCompleteVisible;
export const getIsQuickstartInfoShownBefore = (state: RootState) =>
    state.settings.isQuickstartInfoShownBefore;
