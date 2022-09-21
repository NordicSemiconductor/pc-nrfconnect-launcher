/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../..';

export type SliceState = {
    shouldCheckForUpdatesAtStartup: boolean;
    isUpdateCheckCompleteDialogVisible: boolean;
    isUsageDataDialogVisible: boolean;
    isSendingUsageData: boolean;
};

const initialState: SliceState = {
    shouldCheckForUpdatesAtStartup: true,
    isUpdateCheckCompleteDialogVisible: false,
    isUsageDataDialogVisible: false,
    isSendingUsageData: false,
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
        showUpdateCheckCompleteDialog(state) {
            state.isUpdateCheckCompleteDialogVisible = true;
        },
        hideUpdateCheckCompleteDialog(state) {
            state.isUpdateCheckCompleteDialogVisible = false;
        },
        showUsageDataDialog(state) {
            state.isUsageDataDialogVisible = true;
        },
        hideUsageDataDialog(state) {
            state.isUsageDataDialogVisible = false;
        },
        setUsageDataOn(state) {
            state.isSendingUsageData = true;
        },
        setUsageDataOff(state) {
            state.isSendingUsageData = false;
        },
    },
});

export default slice.reducer;

export const {
    setCheckUpdatesAtStartup,
    showUpdateCheckCompleteDialog,
    hideUpdateCheckCompleteDialog,
    showUsageDataDialog,
    hideUsageDataDialog,
    setUsageDataOn,
    setUsageDataOff,
} = slice.actions;

export const getSettings = (state: RootState) => state.settings;
