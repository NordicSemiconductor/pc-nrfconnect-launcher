/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs';
import type { Draft } from 'immer';
import merge from 'lodash.merge';

import type { Settings, ShownStates, WindowState } from '../ipc/settings';
import { allStandardSourceNames, SourceName } from '../ipc/sources';
import { getConfig } from './config';
import { readFile, writeJsonFile } from './fileUtil';

const defaultWindowSize = {
    width: 1024,
    height: 800,
    maximized: false,
};

const defaultSettings = {
    appFilter: {
        shownStates: {
            installed: true,
            downloadable: true,
        },
        nameFilter: '',
        shownSources: new Set(allStandardSourceNames),
    },
    lastWindowState: defaultWindowSize,
    shouldCheckForUpdatesAtStartup: true,
};

const parseJsonFile = (filePath: string) => {
    if (!fs.existsSync(filePath)) {
        return {};
    }
    try {
        return JSON.parse(readFile(filePath), (key, value) =>
            key === 'shownSources' ? new Set(value) : value
        );
    } catch (err) {
        console.error('Could not load settings. Reason: ', err);
    }
    return {};
};

const load = () => {
    const settings = parseJsonFile(getConfig().settingsJsonPath);
    if (settings && typeof settings === 'object') {
        return merge({}, defaultSettings, settings);
    }

    return merge({}, defaultSettings);
};

let data: Draft<Settings> = load();

const save = () => {
    const dataToSave = {
        ...data,
        appFilter: {
            ...data.appFilter,
            shownSources: [...data.appFilter.shownSources],
        },
    };

    writeJsonFile(getConfig().settingsJsonPath, dataToSave);
};

export const resetSettings = () => {
    data = merge({}, defaultSettings);
    save();
};

export const get = () => data as Settings;

export const addShownSource = (sourceToAdd: SourceName) => {
    data.appFilter.shownSources.add(sourceToAdd);
    save();
};

export const removeShownSource = (sourceToRemove: SourceName) => {
    data.appFilter.shownSources.delete(sourceToRemove);
    save();
};

export const setNameFilter = (nameFilter: string) => {
    data.appFilter.nameFilter = nameFilter;
    save();
};

export const setShownStates = (shownStates: Partial<ShownStates>) => {
    data.appFilter.shownStates = {
        ...data.appFilter.shownStates,
        ...shownStates,
    };
    save();
};

export const setCheckUpdatesAtStartup = (isEnabled: boolean) => {
    data.shouldCheckForUpdatesAtStartup = isEnabled;
    save();
};

export const setLastWindowState = (windowState: WindowState) => {
    data.lastWindowState = { ...windowState };
    save();
};
