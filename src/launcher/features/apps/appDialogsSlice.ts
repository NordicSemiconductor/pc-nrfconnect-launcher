/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import { LaunchableApp } from '../../../ipc/apps';
import type { RootState } from '../../store';

type HiddenDialog = typeof hiddenDialog;
const hiddenDialog = {
    isVisible: false,
} as const;

type VisibleConfirmLaunchDialog = ReturnType<typeof visibleConfirmLaunchDialog>;
const visibleConfirmLaunchDialog = ({
    text,
    app,
}: {
    text: string;
    app: LaunchableApp;
}) =>
    ({
        isVisible: true,
        text,
        app,
    } as const);

export type State = {
    confirmLaunch: HiddenDialog | VisibleConfirmLaunchDialog;
};

const initialState: State = {
    confirmLaunch: hiddenDialog,
};

const slice = createSlice({
    name: 'apps',
    initialState,
    reducers: {
        showConfirmLaunchDialog(
            state,
            { payload }: PayloadAction<{ text: string; app: LaunchableApp }>
        ) {
            state.confirmLaunch = visibleConfirmLaunchDialog(payload);
        },
        hideConfirmLaunchDialog(state) {
            state.confirmLaunch = hiddenDialog;
        },
    },
});

export default slice.reducer;

export const { hideConfirmLaunchDialog, showConfirmLaunchDialog } =
    slice.actions;

export const getConfirmLaunchDialog = (state: RootState) =>
    state.appDialogs.confirmLaunch;
