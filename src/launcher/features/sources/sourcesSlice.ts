/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import { Source, SourceName, SourceUrl } from '../../../ipc/sources';
import type { RootState } from '../../store';

export type State = {
    sources: Source[];
    isAddSourceVisible: boolean;
    sourceToRemove: null | SourceName;
};

const initialState: State = {
    sources: [],
    isAddSourceVisible: false,
    sourceToRemove: null,
};

const sourcesWithout = (sources: Source[], sourceNameToBeRemoved: SourceName) =>
    sources.filter(
        existingSource => existingSource.name !== sourceNameToBeRemoved
    );

const slice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setSources(state, { payload: sources }: PayloadAction<Source[]>) {
            state.sources = [...sources];
        },
        addSource(
            state,
            {
                payload: newSource,
            }: PayloadAction<{
                name: SourceName;
                url: SourceUrl;
            }>
        ) {
            state.sources = [
                ...sourcesWithout(state.sources, newSource.name),
                newSource,
            ];
        },
        removeSource(state, { payload: name }: PayloadAction<SourceName>) {
            state.sources = sourcesWithout(state.sources, name);
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
