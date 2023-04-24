/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import { App, isInstalled } from '../../../ipc/apps';
import {
    type ShownStates,
    getHiddenSources as getPersistedHiddenSources,
    getNameFilter as getPersistedNameFilter,
    getShownStates as getPersistedShownStates,
    setHiddenSources as setPersistedHiddenSources,
    setNameFilter as setPersistedNameFilter,
    setShownStates as setPersistedShownStates,
} from '../../../ipc/persistedStore';
import type { SourceName } from '../../../ipc/sources';
import type { RootState } from '../../store';

export type State = {
    hiddenSources: Set<SourceName>;
    nameFilter: string;
    shownStates: ShownStates;
};

const initialState: State = {
    hiddenSources: getPersistedHiddenSources(),
    nameFilter: getPersistedNameFilter(),
    shownStates: getPersistedShownStates(),
};

const slice = createSlice({
    name: 'filter',
    initialState,
    reducers: {
        showSource(state, { payload: sourceName }: PayloadAction<SourceName>) {
            state.hiddenSources.delete(sourceName);
            setPersistedHiddenSources(state.hiddenSources);
        },
        hideSource(state, { payload: sourceName }: PayloadAction<SourceName>) {
            state.hiddenSources.add(sourceName);
            setPersistedHiddenSources(state.hiddenSources);
        },
        setNameFilter(state, { payload: nameFilter }: PayloadAction<string>) {
            state.nameFilter = nameFilter;
            setPersistedNameFilter(nameFilter);
        },
        setShownStates(
            state,
            { payload: shownStates }: PayloadAction<ShownStates>
        ) {
            state.shownStates = { ...shownStates };
            setPersistedShownStates(shownStates);
        },
    },
});

export default slice.reducer;

export const { showSource, hideSource, setNameFilter, setShownStates } =
    slice.actions;

export const getHiddenSources = (state: RootState) =>
    state.filter.hiddenSources;
export const getNameFilter = (state: RootState) => state.filter.nameFilter;
export const getShownStates = (state: RootState) => state.filter.shownStates;

const matchesSourceFilter = (app: App, state: RootState) =>
    !state.filter.hiddenSources.has(app.source);

const matchesNameFilter = (app: App, state: RootState) => {
    const filter = state.filter.nameFilter;

    try {
        return new RegExp(filter, 'i').test(app.displayName);
    } catch (_) {
        // Ignore faulty regexps
    }
    return app.displayName?.includes(filter);
};

const matchesStateFilter = (app: App, state: RootState) =>
    (state.filter.shownStates.installed && isInstalled(app)) ||
    (state.filter.shownStates.downloadable && !isInstalled(app));

export const getAppsFilter = (state: RootState) => (app: App) =>
    matchesSourceFilter(app, state) &&
    matchesNameFilter(app, state) &&
    matchesStateFilter(app, state);
