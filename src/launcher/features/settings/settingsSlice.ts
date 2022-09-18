/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import { SourceName, Sources, SourceUrl } from '../../../ipc/sources';
import type { RootState } from '../..';

export type SliceState = {
    shouldCheckForUpdatesAtStartup: boolean;
    isUpdateCheckCompleteDialogVisible: boolean;
    sources: Sources;
    isAddSourceDialogVisible: boolean;
    isRemoveSourceDialogVisible: boolean;
    removeSource: null | SourceName;
    isUsageDataDialogVisible: boolean;
    isSendingUsageData: boolean;
};

const initialState: SliceState = {
    shouldCheckForUpdatesAtStartup: true,
    isUpdateCheckCompleteDialogVisible: false,
    sources: {},
    isAddSourceDialogVisible: false,
    isRemoveSourceDialogVisible: false,
    removeSource: null,
    isUsageDataDialogVisible: false,
    isSendingUsageData: false,
};

const slice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setSources(state, { payload: sources }: PayloadAction<Sources>) {
            state.sources = { ...sources };
        },
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
        addSource(
            state,
            action: PayloadAction<{
                name: SourceName;
                url: SourceUrl;
            }>
        ) {
            state.sources[action.payload.name] = action.payload.url;
        },
        removeSource(state, { payload: name }: PayloadAction<SourceName>) {
            delete state.sources[name];
        },
        showAddSourceDialog(state) {
            state.isAddSourceDialogVisible = true;
        },
        hideAddSourceDialog(state) {
            state.isAddSourceDialogVisible = false;
        },
        showRemoveSourceDialog(
            state,
            { payload: name }: PayloadAction<SourceName>
        ) {
            state.isRemoveSourceDialogVisible = true;
            state.removeSource = name;
        },
        hideRemoveSourceDialog(state) {
            state.isRemoveSourceDialogVisible = false;
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
    setSources,
    setCheckUpdatesAtStartup,
    showUpdateCheckCompleteDialog,
    hideUpdateCheckCompleteDialog,
    addSource,
    removeSource,
    showAddSourceDialog,
    hideAddSourceDialog,
    showRemoveSourceDialog,
    hideRemoveSourceDialog,
    showUsageDataDialog,
    hideUsageDataDialog,
    setUsageDataOn,
    setUsageDataOff,
} = slice.actions;

export const getSettings = (state: RootState) => state.settings;
