/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../../store';

const isWindows = process.platform === 'win32';
const isMac = process.platform === 'darwin';

export type State = {
    isUpdateAvailableDialogVisible: boolean;
    isUpdateProgressDialogVisible: boolean;
    isProgressSupported: boolean;
    isCancelSupported: boolean;
    latestVersion: string;
    percentDownloaded: number;
    isCancelling: boolean;
};

const initialState: State = {
    isUpdateAvailableDialogVisible: false,
    isUpdateProgressDialogVisible: false,
    isProgressSupported: false,
    isCancelSupported: false,
    latestVersion: '',
    percentDownloaded: 0,
    isCancelling: false,
};

const slice = createSlice({
    name: 'launcherUpdate',
    initialState,
    reducers: {
        updateAvailable(
            state,
            { payload: availableVersion }: PayloadAction<string>
        ) {
            state.isUpdateAvailableDialogVisible = true;
            state.latestVersion = availableVersion;
        },
        startDownload(
            state,
            {
                payload: {
                    isCancelSupported = isWindows,
                    isProgressSupported = isWindows || isMac,
                } = {},
            }: PayloadAction<
                | {
                      isCancelSupported?: boolean;
                      isProgressSupported?: boolean;
                  }
                | undefined
            >
        ) {
            state.isUpdateAvailableDialogVisible = false;
            state.isUpdateProgressDialogVisible = true;
            state.isProgressSupported = isProgressSupported;
            state.isCancelSupported = isCancelSupported;
        },
        cancelDownload(state) {
            state.isCancelling = true;
        },
        updateDownloading(state, action: PayloadAction<number>) {
            state.percentDownloaded = Math.floor(action.payload);
        },
        reset() {
            return initialState;
        },
    },
});

export default slice.reducer;

export const {
    updateAvailable,
    startDownload,
    cancelDownload,
    updateDownloading,
    reset,
} = slice.actions;

export const getLauncherUpdate = (state: RootState) => state.launcherUpdate;
