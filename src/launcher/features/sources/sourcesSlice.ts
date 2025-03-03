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

type Hidden = typeof hidden;
const hidden = { isVisible: false } as const;

type WarnAboutMissingTokenOnAddSource = {
    isVisible: true;
    sourceToAdd: SourceUrl;
};
export const isWarningAboutMissingTokenOnAddSource = (
    warning: MissingTokenWarning
): warning is WarnAboutMissingTokenOnAddSource =>
    warning.isVisible && 'sourceToAdd' in warning;

type WarnAboutMissingTokenOnMigratingSources = {
    isVisible: true;
    sourcesWithRestrictedAccessLevel: Source[];
};
export const isWarningAboutMissingTokenOnMigratingSources = (
    warning: MissingTokenWarning
): warning is WarnAboutMissingTokenOnMigratingSources =>
    warning.isVisible && 'sourcesWithRestrictedAccessLevel' in warning;

type MissingTokenWarning =
    | Hidden
    | WarnAboutMissingTokenOnAddSource
    | WarnAboutMissingTokenOnMigratingSources;

export type State = {
    sources: Source[];
    isAddSourceVisible: boolean;
    sourceToRemove: null | SourceName;
    deprecatedSources: Source[];
    doNotRemindDeprecatedSources: boolean;
    sourceToAdd: null | SourceUrl;
    missingTokenWarning: MissingTokenWarning;
};

const initialState: State = {
    sources: [],
    isAddSourceVisible: false,
    sourceToRemove: null,
    deprecatedSources: [],
    doNotRemindDeprecatedSources: getPersistedDoNotRemindDeprecatedSources(),
    sourceToAdd: null,
    missingTokenWarning: hidden,
};

const sourcesWithout = (sources: Source[], sourceNameToBeRemoved: SourceName) =>
    sources.filter(
        existingSource => existingSource.name !== sourceNameToBeRemoved
    );

const slice = createSlice({
    name: 'sources',
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
        warnAboutMissingTokenOnAddSource(
            state,
            { payload: sourceToAdd }: PayloadAction<SourceUrl>
        ) {
            state.missingTokenWarning = {
                isVisible: true,
                sourceToAdd,
            };
        },
        warnAboutMissingTokenOnMigratingSources(
            state,
            { payload: sources }: PayloadAction<Source[]>
        ) {
            state.missingTokenWarning = {
                isVisible: true,
                sourcesWithRestrictedAccessLevel: [...sources],
            };
        },
        hideWarningAboutMissingToken(state) {
            state.missingTokenWarning = hidden;
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
    warnAboutMissingTokenOnAddSource,
    warnAboutMissingTokenOnMigratingSources,
    hideWarningAboutMissingToken,
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
export const getMissingTokenWarning = (state: RootState) =>
    state.sources.missingTokenWarning;
