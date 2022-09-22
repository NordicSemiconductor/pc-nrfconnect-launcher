/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../..';

export type State = {
    isUsageDataDialogVisible: boolean;
    isSendingUsageData: boolean;
};

const initialState: State = {
    isUsageDataDialogVisible: false,
    isSendingUsageData: false,
};

const slice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
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
    showUsageDataDialog,
    hideUsageDataDialog,
    setUsageDataOn,
    setUsageDataOff,
} = slice.actions;

export const getIsUsageDataDialogVisible = (state: RootState) =>
    state.usageData.isUsageDataDialogVisible;
export const getIsSendingUsageData = (state: RootState) =>
    state.usageData.isSendingUsageData;
