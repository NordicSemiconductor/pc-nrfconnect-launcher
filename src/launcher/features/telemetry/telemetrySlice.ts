/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../store';

export type State = {
    isTelemetryDialogVisible: boolean;
    isSendingTelemetry: boolean;
};

const initialState: State = {
    isTelemetryDialogVisible: false,
    isSendingTelemetry: false,
};

const slice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        showTelemetryDialog(state) {
            state.isTelemetryDialogVisible = true;
        },
        hideTelemetryDialog(state) {
            state.isTelemetryDialogVisible = false;
        },
        setIsSendingTelemetry(
            state,
            { payload: isSendingTelemetry }: PayloadAction<boolean>
        ) {
            state.isSendingTelemetry = isSendingTelemetry;
        },
    },
});

export default slice.reducer;

export const {
    showTelemetryDialog,
    hideTelemetryDialog,
    setIsSendingTelemetry,
} = slice.actions;

export const getIsTelemetryDialogVisible = (state: RootState) =>
    state.telemetry.isTelemetryDialogVisible;
export const getIsSendingTelemetry = (state: RootState) =>
    state.telemetry.isSendingTelemetry;
