/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import { App, isInstalled } from '../../../ipc/apps';
import type { Settings, ShownStates } from '../../../ipc/settings';
import type { SourceName } from '../../../ipc/sources';
import type { RootState } from '../../store';

export type State = Settings['appFilter'];

const initialState: State = {
    shownSources: new Set(),
    nameFilter: '',
    shownStates: {
        downloadable: true,
        installed: true,
    },
};

const slice = createSlice({
    name: 'filter',
    initialState,
    reducers: {
        setAllShownSources(
            state,
            { payload: shownSources }: PayloadAction<ReadonlySet<SourceName>>
        ) {
            state.shownSources = new Set(shownSources);
        },
        showSource(state, { payload: sourceName }: PayloadAction<SourceName>) {
            state.shownSources.add(sourceName);
        },
        hideSource(state, { payload: sourceName }: PayloadAction<SourceName>) {
            state.shownSources.delete(sourceName);
        },
        setNameFilter(state, { payload: nameFilter }: PayloadAction<string>) {
            state.nameFilter = nameFilter;
        },
        setShownStates(
            state,
            { payload: shownStates }: PayloadAction<Partial<ShownStates>>
        ) {
            state.shownStates = {
                ...state.shownStates,
                ...shownStates,
            };
        },
    },
});

export default slice.reducer;

export const {
    setAllShownSources,
    showSource,
    hideSource,
    setNameFilter,
    setShownStates,
} = slice.actions;

export const getShownSources = (state: RootState) => state.filter.shownSources;
export const getNameFilter = (state: RootState) => state.filter.nameFilter;
export const getShownStates = (state: RootState) => state.filter.shownStates;

const matchesSourceFilter = (app: App, state: RootState) =>
    state.filter.shownSources.has(app.source);

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
