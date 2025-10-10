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

type VisibleConfirmLaunchDialog = {
    isVisible: true;
    app: LaunchableApp;
    title: string;
    text: React.ReactNode;
    warningData: Record<string, unknown>;
    setQuickStartInfoWasShown: boolean;
};

type VisibleInstallOtherVersionDialog = {
    isVisible: true;
    app: DownloadableApp;
};

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
                app: LaunchableApp;
                title: string;
                text: React.ReactNode;
                warningData: Record<string, unknown>;
                setQuickStartInfoWasShown: boolean;
            }>,
        ) {
            state.confirmLaunch = {
                isVisible: true,
                ...payload,
            };
        },
        hideConfirmLaunchDialog(state) {
            state.confirmLaunch = hiddenDialog;
        },
        showInstallOtherVersionDialog(
            state,
            { payload: app }: PayloadAction<DownloadableApp>,
        ) {
            state.installOtherVersion = { isVisible: true, app };
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
