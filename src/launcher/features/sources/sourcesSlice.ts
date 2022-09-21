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
    sources: Sources;
    isAddSourceVisible: boolean;
    sourceToRemove: null | SourceName;
};

const initialState: SliceState = {
    sources: {},
    isAddSourceVisible: false,
    sourceToRemove: null,
};

const slice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setSources(state, { payload: sources }: PayloadAction<Sources>) {
            state.sources = { ...sources };
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
        showAddSource(state) {
            state.isAddSourceVisible = true;
        },
        hideAddSource(state) {
            state.isAddSourceVisible = false;
        },
        showRemoveSource(state, { payload: name }: PayloadAction<SourceName>) {
            state.sourceToRemove = name;
        },
        hideRemoveSource(state) {
            state.sourceToRemove = null;
        },
    },
});

export default slice.reducer;

export const {
    setSources,
    addSource,
    removeSource,
    showAddSource,
    hideAddSource,
    showRemoveSource,
    hideRemoveSource,
} = slice.actions;

export const getSources = (state: RootState) => state.sources.sources;
export const getIsAddSourceVisible = (state: RootState) =>
    state.sources.isAddSourceVisible;
export const getIsRemoveSourceVisible = (state: RootState) =>
    state.sources.sourceToRemove != null;
export const getSourceToRemove = (state: RootState) =>
    state.sources.sourceToRemove;
