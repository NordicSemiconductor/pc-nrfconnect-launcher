/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import { LaunchableApp } from '../../../ipc/apps';
import type { RootState } from '../../store';

export type State = {
    confirmLaunchIsDialogVisible: boolean;
    confirmLaunchText?: string;
    confirmLaunchApp?: LaunchableApp;
};

const initialState: State = {
    confirmLaunchIsDialogVisible: false,
};

const slice = createSlice({
    name: 'apps',
    initialState,
    reducers: {
        showConfirmLaunchDialog(
            state,
            { payload }: PayloadAction<{ text: string; app: LaunchableApp }>
        ) {
            state.confirmLaunchIsDialogVisible = true;
            state.confirmLaunchText = payload.text;
            state.confirmLaunchApp = payload.app;
        },
        hideConfirmLaunchDialog(state) {
            state.confirmLaunchIsDialogVisible = false;
            state.confirmLaunchText = initialState.confirmLaunchText;
            state.confirmLaunchApp = initialState.confirmLaunchApp;
        },
    },
});

export default slice.reducer;

export const { hideConfirmLaunchDialog, showConfirmLaunchDialog } =
    slice.actions;

export const getConfirmLaunchDialog = (state: RootState) => ({
    isVisible: state.appDialogs.confirmLaunchIsDialogVisible,
    text: state.appDialogs.confirmLaunchText,
    app: state.appDialogs.confirmLaunchApp,
});
