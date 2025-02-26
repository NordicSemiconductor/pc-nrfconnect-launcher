/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import {
    getDoNotRemindDeprecatedSources as getPersistedDoNotRemindDeprecatedSources,
    setDoNotRemindDeprecatedSources as setPersistedDoNotRemindDeprecatedSources,
} from '../../../common/persistedStore';
import { Source, SourceName, SourceUrl } from '../../../ipc/sources';
import type { RootState } from '../../store';

export type State = {
    sources: Source[];
    isAddSourceVisible: boolean;
    sourceToRemove: null | SourceName;
    deprecatedSources: Source[];
    doNotRemindDeprecatedSources: boolean;
    sourceToAdd: null | SourceUrl;
};

const initialState: State = {
    sources: [],
    isAddSourceVisible: false,
    sourceToRemove: null,
    deprecatedSources: [],
    doNotRemindDeprecatedSources: getPersistedDoNotRemindDeprecatedSources(),
    sourceToAdd: null,
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
        showDeprecatedSources(
            state,
            { payload: sources }: PayloadAction<Source[]>
        ) {
            state.deprecatedSources = [...sources];
        },
        hideDeprecatedSources(state) {
            state.deprecatedSources = [];
        },
        doNotRemindDeprecatedSources(state) {
            state.doNotRemindDeprecatedSources = true;
            setPersistedDoNotRemindDeprecatedSources();
        },
        warnAddLegacySource(state, { payload: url }: PayloadAction<SourceUrl>) {
            state.sourceToAdd = url;
        },
        clearSourceToAdd(state) {
            state.sourceToAdd = null;
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
    showDeprecatedSources,
    hideDeprecatedSources,
    doNotRemindDeprecatedSources,
    warnAddLegacySource,
    clearSourceToAdd,
} = slice.actions;

export const getSources = (state: RootState) => state.sources.sources;
export const getIsAddSourceVisible = (state: RootState) =>
    state.sources.isAddSourceVisible;
export const getIsRemoveSourceVisible = (state: RootState) =>
    state.sources.sourceToRemove != null;
export const getSourceToRemove = (state: RootState) =>
    state.sources.sourceToRemove;
export const getDeprecatedSources = (state: RootState) =>
    state.sources.deprecatedSources;
export const getDoNotRemindDeprecatedSources = (state: RootState) =>
    state.sources.doNotRemindDeprecatedSources;
export const getSourceToAdd = (state: RootState) => state.sources.sourceToAdd;
