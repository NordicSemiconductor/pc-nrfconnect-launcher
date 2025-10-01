/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { JLinkUpdate } from '@nordicsemiconductor/nrf-jlink-js';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../../store';

export type State = {
    versionToBeInstalled?: string;
    installedVersion: string | undefined;
    isJLinkUpdateAvailableDialogVisible: boolean;
    isJLinkUpdateProgressDialogVisible: boolean;
    updateProgress?: JLinkUpdate;
};

const initialState: State = {
    installedVersion: undefined,
    isJLinkUpdateAvailableDialogVisible: false,
    isJLinkUpdateProgressDialogVisible: false,
};

const slice = createSlice({
    name: 'jlinkUpdate',
    initialState,
    reducers: {
        updateAvailable(
            state,
            {
                payload: {
                    versionToBeInstalled: availableVersion,
                    installedVersion,
                },
            }: PayloadAction<{
                versionToBeInstalled: string;
                installedVersion: string | undefined;
            }>,
        ) {
            state.isJLinkUpdateAvailableDialogVisible = true;
            state.versionToBeInstalled = availableVersion;
            state.installedVersion = installedVersion;
        },
        showProgressDialog(state) {
            state.isJLinkUpdateAvailableDialogVisible = false;
            state.isJLinkUpdateProgressDialogVisible = true;
        },
        updateProgress(state, { payload: update }: PayloadAction<JLinkUpdate>) {
            state.updateProgress = update;
        },
        reset() {
            return initialState;
        },
    },
});

export default slice.reducer;

export const { updateAvailable, showProgressDialog, updateProgress, reset } =
    slice.actions;

export const isJLinkUpdateDialogVisible = (state: RootState) =>
    state.jlinkUpdate.isJLinkUpdateAvailableDialogVisible;
export const isJLinkUpdateProgressDialogVisible = (state: RootState) =>
    state.jlinkUpdate.isJLinkUpdateProgressDialogVisible;
export const getJLinkUpdateProgress = (state: RootState) =>
    state.jlinkUpdate.updateProgress;
export const getJLinkVersionToBeInstalled = (state: RootState) =>
    state.jlinkUpdate.versionToBeInstalled;
export const getInstalledJLinkVersion = (state: RootState) =>
    state.jlinkUpdate.installedVersion;
