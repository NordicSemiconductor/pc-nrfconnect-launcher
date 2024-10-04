/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import { DownloadableApp, LaunchableApp } from '../../../ipc/apps';
import type { RootState } from '../../store';

type HiddenDialog = typeof hiddenDialog;
const hiddenDialog = {
    isVisible: false,
} as const;

type VisibleConfirmLaunchDialog = ReturnType<typeof visibleConfirmLaunchDialog>;
const visibleConfirmLaunchDialog = (
    text: React.ReactNode,
    app: LaunchableApp
) => ({ isVisible: true, text, app } as const);

type VisibleInstallOtherVersionDialog = ReturnType<
    typeof visibleInstallOtherVersionDialog
>;
const visibleInstallOtherVersionDialog = (app: DownloadableApp) =>
    ({ isVisible: true, app } as const);

export type State = {
    confirmLaunch: HiddenDialog | VisibleConfirmLaunchDialog;
    installOtherVersion: HiddenDialog | VisibleInstallOtherVersionDialog;
};

const initialState: State = {
    confirmLaunch: hiddenDialog,
    installOtherVersion: hiddenDialog,
};

const slice = createSlice({
    name: 'apps',
    initialState,
    reducers: {
        showConfirmLaunchDialog(
            state,
            {
                payload,
            }: PayloadAction<{
                text: React.ReactNode;
                app: LaunchableApp;
            }>
        ) {
            state.confirmLaunch = visibleConfirmLaunchDialog(
                payload.text,
                payload.app
            );
        },
        hideConfirmLaunchDialog(state) {
            state.confirmLaunch = hiddenDialog;
        },
        showInstallOtherVersionDialog(
            state,
            { payload: app }: PayloadAction<DownloadableApp>
        ) {
            state.installOtherVersion = visibleInstallOtherVersionDialog(app);
        },
        hideInstallOtherVersionDialog(state) {
            state.installOtherVersion = hiddenDialog;
        },
    },
});

export default slice.reducer;

export const {
    hideConfirmLaunchDialog,
    hideInstallOtherVersionDialog,
    showConfirmLaunchDialog,
    showInstallOtherVersionDialog,
} = slice.actions;

export const getConfirmLaunchDialog = (state: RootState) =>
    state.appDialogs.confirmLaunch;

export const getInstallOtherVersionDialog = (state: RootState) =>
    state.appDialogs.installOtherVersion;
