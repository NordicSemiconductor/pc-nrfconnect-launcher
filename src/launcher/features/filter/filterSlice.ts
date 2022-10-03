/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import { App } from '../../../ipc/apps';
import { SourceName } from '../../../ipc/sources';
import type { RootState } from '../..';

type ShownStates = {
    available: boolean;
    installed: boolean;
};

export type State = {
    shownSources: Set<SourceName>;
    nameFilter: string;
    shownStates: ShownStates;
};

const initialState: State = {
    shownSources: new Set(),
    nameFilter: '',
    shownStates: {
        available: true,
        installed: true,
    },
};

const slice = createSlice({
    name: 'filter',
    initialState,
    reducers: {
        setAllShownSources(
            state,
            { payload: shownSources }: PayloadAction<SourceName[]>
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
    (state.filter.shownStates.installed && app.isInstalled) ||
    (state.filter.shownStates.available && !app.isInstalled);

export const getAppsFilter = (state: RootState) => (app: App) =>
    matchesSourceFilter(app, state) &&
    matchesNameFilter(app, state) &&
    matchesStateFilter(app, state);
