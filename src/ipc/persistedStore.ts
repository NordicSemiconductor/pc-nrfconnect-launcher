/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import Store from 'electron-store';

import { SourceName } from './sources';

type WindowState = {
    x?: number;
    y?: number;
    width: number;
    height: number;
    maximized: boolean;
};

export type ShownStates = {
    downloadable: boolean;
    installed: boolean;
};

interface Schema {
    lastWindowState: WindowState;
    updateCheck: {
        doOnStartup: boolean;
    };
    appFilter: {
        hiddenSources: SourceName[];
        nameFilter: string;
        shownStates: ShownStates;
    };
}

const store = new Store<Schema>();

export const resetStore = () => store.clear();

const defaultWindowSize = {
    width: 1024,
    height: 800,
    maximized: false,
};
export const getLastWindowState = () =>
    store.get('lastWindowState', defaultWindowSize);
export const setLastWindowState = (lastWindowState: WindowState) =>
    store.set('lastWindowState', lastWindowState);

export const getCheckForUpdatesAtStartup = () =>
    store.get('updateCheck')?.doOnStartup ?? true;
export const setCheckForUpdatesAtStartup = (checkUpdatesAtStartup: boolean) =>
    store.set('updateCheck.doOnStartup', checkUpdatesAtStartup);

export const getHiddenSources = () =>
    new Set(store.get('appFilter')?.hiddenSources ?? []);
export const setHiddenSources = (hiddenSources: Set<SourceName>) =>
    store.set('appFilter.hiddenSources', [...hiddenSources]);

export const getNameFilter = () => store.get('appFilter')?.nameFilter ?? '';
export const setNameFilter = (nameFilter: string) =>
    store.set('appFilter.nameFilter', nameFilter);

const defaultShownStates = {
    downloadable: true,
    installed: true,
};
export const getShownStates = () =>
    store.get('appFilter')?.shownStates ?? defaultShownStates;
export const setShownStates = (shownStates: ShownStates) =>
    store.set('appFilter.shownStates', shownStates);
